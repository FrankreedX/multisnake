const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app);

const {Server} = require('socket.io')
const io = new Server(server)

const game = require('./game.js')
let broadcaster
let gameStates = new Map()

app.use(express.static('./public'))

// app.get('/', (req, res) => {
//     res.send()
// })

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function startGame(gameState){
    broadcaster.emit('snake update', gameState)
    for(let i = 3; i >= 0; i--){
        if(i !== 0)
            broadcaster.emit('initial countdown', i)
        else
            game.spawnFood(gameState)
        await sleep(1000)
    }

    gameState['frame'] = 0
    console.log("playing state: ", gameState)
    broadcaster.emit('snake update', gameState)
    broadcaster.emit('get input', gameState)
}

io.on('connection', (socket) => {
    socket.on('createRoom', (values) => {
        let gameState = {
            'boardCol': values.boardCol,
            'boardRow': values.boardRow,
            'player1id': socket.id,
            'roomid': socket.id,
            'frame': 0,
            'framerate': 15,
            'food': [],
            'foodCounter': 0,
            'snake1': [],
            'snake1Direction': 3,
            'snake2': [],
            'snake2Direction': 1,
            'gameFinished': false,
            'receivedInput1': true,
            'receivedInput2': true
        }
        for(let i = 0; i < 15; i++){
            gameState.snake1.unshift([gameState.boardRow / 2, i])
            gameState.snake2.unshift([gameState.boardRow / 2 + 10, gameState.boardCol - i - 1])
        }
        console.log("created room id: ", gameState.roomid)
        socket.data.roomid = socket.id
        broadcaster = io.to(gameState.roomid)
        gameStates.set(socket.id, gameState)
        socket.emit("room created", gameState.roomid)
    })

    socket.on('joinRoom', (roomid) => {
        console.log("Player ", socket.id, " tried joining room ", roomid)
        let gameState = gameStates.get(roomid)
        if (gameState === undefined) {
            socket.emit('room not found')
            return
        }
        if (gameState.player2id !== undefined){
            socket.emit('room occupied')
            return
        }
        socket.join(gameState.roomid)
        socket.data.roomid = gameState.roomid
        gameState['player2id'] = socket.id
        broadcaster.emit('player 2 joined the room')
        startGame(gameState).then(() => {
            gameState.gameFinished = true
        })
    })

    socket.on('send input', (direction) => {
        let time = new Date()
        let gameState = gameStates.get(socket.data.roomid)
        if (gameState === undefined) {
            socket.emit('room not found')
            return
        }
        console.log("received data ", direction.dir, "from id ", socket.id, " on frame ", direction.frame)
        if (socket.id === gameState.player1id) {
            gameState.snake1Direction = direction.dir
            gameState.receivedInput1 = true
        } else if (socket.id === gameState.player2id) {
            gameState.snake2Direction = direction.dir
            gameState.receivedInput2 = true
        } else {
            socket.emit('not in room')
            return
        }
        if (gameState.receivedInput1 && gameState.receivedInput2) {
            gameState.receivedInput1 = false
            gameState.receivedInput2 = false

            game.play(broadcaster, gameState, gameState.framerate)
            broadcaster.emit('snake update', gameState)
            gameState['frame']++
            time = new Date() - time
            sleep((1000 / (15 + (gameState.foodCounter / 3))) - time).then(() => {
                broadcaster.emit('get input', gameState)
            })
        }
    })

    socket.on('updateFramerate', (framerate) => {
        let gameState = gameStates.get(socket.data.roomid)
        if (gameState === undefined) {
            socket.emit('room not found')
            return
        }
        gameState.frame = framerate
    })

    socket.on('rematch', () => {
        let gameState = gameStates.get(socket.data.roomid)
        if (gameState === undefined) {
            socket.emit('room not found')
            return
        }
        console.log("rematch requested from room id ", socket.data.roomid)
        gameState.gameFinished = false
        gameState.food = []
        gameState.foodCounter = 0
        gameState.snake1 = []
        gameState.snake2 = []
        gameState.snake1Direction = 3
        gameState.snake2Direction = 1

        for(let i = 0; i < 15; i++){
            gameState.snake1.unshift([gameState.boardRow / 2, i])
            gameState.snake2.unshift([gameState.boardRow / 2 + 10, gameState.boardCol - i - 1])
        }

        startGame(gameState).then(() => {
            gameState.gameFinished = true
        })
    })

    console.log('a user connected')
    socket.on('disconnect', () => {
        let gameState = gameStates.get(socket.data.roomid)
        if(gameState !== undefined) {
            console.log('user disconnected from room ', socket.data.roomid)
            broadcaster.emit('player left room')
            gameState.gameFinished = true
            gameStates.delete(socket.data.roomid)
        }
    })
})

let port = process.env.PORT || 3000
server.listen(port, () => {
    console.log('listening on *:', port)
})
