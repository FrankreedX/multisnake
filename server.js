const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app);

const {Server} = require('socket.io')
const io = new Server(server)

const game = require('./game.js')
let gameStates = new Map()

app.use(express.static('./public'))

// app.get('/', (req, res) => {
//     res.send()
// })

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function startGame(gameState){
    io.to(gameState.roomid).emit('snake update', gameState)
    for(let i = 3; i >= 0; i--){
        if(i !== 0)
            io.to(gameState.roomid).emit('initial countdown', i)
        else
            game.spawnFood(gameState)
        await sleep(1000)
    }
    await game.play(io.to(gameState.roomid), gameState)
}

io.on('connection', (socket) => {
    socket.on('createRoom', (values) => {
        let gameState = {
            'boardCol': values.boardCol,
            'boardRow': values.boardRow,
            'player1id': socket.id,
            'roomid': socket.id,
            'food': [],
            'foodCounter': 0,
            'snake1': [],
            'snake1Direction': 3,
            'snake2': [],
            'snake2Direction': 1,
            'gameFinished': false,
        }
        for(let i = 0; i < 15; i++){
            gameState.snake1.unshift([gameState.boardRow / 2, i])
            gameState.snake2.unshift([gameState.boardRow / 2 + 10, gameState.boardCol - i - 1])
        }
        console.log("created room id: ", gameState.roomid)
        socket.data.roomid = socket.id
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
        io.to(gameState.roomid).emit('player 2 joined the room')
        startGame(gameState).then(() => {
            gameState.gameFinished = true
        })
    })

    socket.on('send input', (direction) => {
        let gameState = gameStates.get(socket.data.roomid)
        if (gameState === undefined) {
            socket.emit('room not found')
            return
        }
        console.log("received data ", direction, "from id ", socket.id)
        if (socket.id === gameState.player1id) {
            gameState.snake1Direction = direction
        } else if (socket.id === gameState.player2id) {
            gameState.snake2Direction = direction
        } else {
            socket.emit('not in room')
        }
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
            io.to(gameState.roomid).emit('player left room')
            gameStates.delete(socket.data.roomid)
        }
    })
})

let port = process.env.PORT || 3000
server.listen(port, () => {
    console.log('listening on *:', port)
})
