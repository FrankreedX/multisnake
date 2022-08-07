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

function initializeSnakes(gameState) {
    gameState.snakes = []
    for (let n = 0; n < 2; n++) {
        let currentSnake = {
            'body_coords': [],
            'direction': n * 2 + 1,
            'skin_head': ['Assets/head_snake_red.png', 'Assets/head_snake_blue.png'],
            'skin_body_straight': ['Assets/body_red.png', 'Assets/body_blue.png'],
            'skin_body_angle': ['Assets/90_degree_turn_red.png', 'Assets/90_degree_turn_blue.png'],
            'skin_tail': ['Assets/tail_red.png', 'Assets/tail_blue.png'],
            'received_input': true
        }
        gameState.snakes.push(currentSnake)
    }
    for (let i = 0; i < 15; i++) {
        gameState.snakes[0].body_coords.unshift([Math.floor(gameState.boardRow / 2 - 5), i])
        gameState.snakes[1].body_coords.unshift([Math.floor(gameState.boardRow / 2 + 5), gameState.boardCol - i - 1])
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function startGame(gameState) {
    broadcaster.emit('snake update', gameState)
    for (let i = 3; i >= 0; i--) {
        if (i !== 0)
            broadcaster.emit('initial countdown', i)
        else
            game.spawnFood(gameState)
        await sleep(1000)
    }

    gameState.frame = 0
    gameState.gameFinished = false
    console.log("playing state: ", gameState)
    broadcaster.emit('snake update', gameState)
    broadcaster.emit('get input', gameState)
}

io.on('connection', (socket) => {
    console.log('user id ', socket.id, ' connected')

    socket.on('echoTest', (message) => {
        console.log('server echo', message)
        socket.emit('echo', message)
    })

    socket.on('getSnake', () => {
        socket.emit('snakeUpdate', gameStates.get(socket.data.roomid))
    })

    socket.on('createRoom', (values) => {
        let gameState = {
            'boardCol': values.boardCol,
            'boardRow': values.boardRow,
            'playerIDs': [socket.id],
            'roomid': socket.id,
            'roomPlayerNum': 2,
            'frame': 0,
            'framerate': 15,
            'debug': values.debugMode,
            'food': [],
            'foodCounter': 0,
            'snakes': [],
            'gameFinished': false,
        }
        initializeSnakes(gameState)
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
        if (gameState.playerIDs.length === gameState.roomPlayerNum) {
            socket.emit('room occupied')
            return
        }
        socket.join(gameState.roomid)
        socket.data.roomid = gameState.roomid
        gameState.playerIDs.push(socket.id)
        broadcaster.emit(`player ${gameState.playerIDs.length} joined the room`)
        startGame(gameState)
    })

    socket.on('send input', (direction) => {
        let time = new Date()
        let gameState = gameStates.get(socket.data.roomid)
        if (gameState === undefined) {
            socket.emit('room not found')
            return
        }
        if (gameState.gameFinished){
            socket.emit('game finished')
            return
        }
        console.log("received data ", direction.dir, "from id ", socket.id, " on frame ", direction.frame)
        let snakeIndex = gameState.playerIDs.indexOf(socket.id)
        if (snakeIndex === -1) {
            socket.emit('not in room')
            return
        }
        gameState.snakes[snakeIndex].direction = direction.dir
        gameState.snakes[snakeIndex].received_input = true
        for (let i = 0; i < gameState.snakes.length; i++) {
            if (!gameState.snakes[i].received_input)
                return
        }
        console.log("all inputs received")

        for(let i = 0; i < gameState.snakes.length; i++){
            gameState.snakes[i].received_input = false
        }

        game.play(broadcaster, gameState)
        broadcaster.emit('snake update', gameState)
        gameState.frame++
        time = new Date() - time
        console.log("time: ", time)
        if (!gameState.debug) {
            gameState.framerate = 10 + gameState.foodCounter
        }
        console.log("pausing for ", 1000 / gameState.framerate - time)
        sleep(1000 / gameState.framerate - time).then(() => {
            broadcaster.emit('get input', gameState)
        })
    })

    socket.on('updateFramerate', (framerate) => {
        let gameState = gameStates.get(socket.data.roomid)
        if (gameState === undefined) {
            socket.emit('room not found')
            return
        }
        if (gameState.debug)
            gameState.framerate = framerate
    })

    socket.on('rematch', () => {
        let gameState = gameStates.get(socket.data.roomid)
        if (gameState === undefined) {
            socket.emit('room not found')
            return
        }
        console.log("rematch requested from room id ", socket.data.roomid)
        gameState.gameFinished = true
        gameState.food = []
        gameState.foodCounter = 0

        initializeSnakes(gameState)

        startGame(gameState)
    })
    socket.on('disconnect', () => {
        let gameState = gameStates.get(socket.data.roomid)
        if (gameState !== undefined) {
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

exports.server = server
