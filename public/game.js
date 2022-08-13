let socket = io();
let roomid;
let gameState = {'gameFinished': false};

let frameDirectionQueue = []
let bufferedDirectionQueue = []

let boardRow = 25
let boardCol = 50

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function createRoom() {
    socket.emit('createRoom', {'boardCol': boardCol, 'boardRow': boardRow, 'debugMode': debug})
    document.getElementById('roomid').textContent = "Room created: " + socket.id
}

function joinRoom(room) {
    socket.emit('joinRoom', room)
}

function echoTest(message) {
    socket.emit('echoTest', message)
}

function rematch() {
    socket.emit('rematch')
}

function updateFramerate(fps) {
    socket.emit('updateFramerate', fps)
}

socket.on('room created', (room) => {
    roomid = room
})

socket.on('echo', (message) => {
    console.log('client echoing', message)
})

socket.on('get input', (game) => {
    gameState = game
    if (frameDirectionQueue.length > 0) {
        bufferedDirectionQueue = frameDirectionQueue
    }
    frameDirectionQueue = []
    let snakeDirection = gameState.snakes[gameState.playerIDs.indexOf(socket.id)].direction
    let nextDir = bufferedDirectionQueue.shift()
    console.log("next Dir: ", nextDir)
    if ((nextDir !== undefined && nextDir !== null) && Math.abs(snakeDirection - nextDir) !== 2) {
        snakeDirection = nextDir
    }
    console.log("Sending direciton ", snakeDirection)
    socket.emit('send input', {dir: snakeDirection, frame: gameState.frame})
})

document.addEventListener('keydown', function (event) {
    let nextDir = -1
    switch (event.key) {
        case "ArrowUp":
        case "w":
        case "W":
            nextDir = 0
            console.log('Up was pressed');
            break;
        case "ArrowRight":
        case "d":
        case "D":
            nextDir = 1
            console.log('Right was pressed');
            break;
        case "ArrowDown":
        case "s":
        case "S":
            nextDir = 2
            console.log('Down was pressed');
            break;
        case "ArrowLeft":
        case "a":
        case "A":
            nextDir = 3
            console.log('Left was pressed');
            break;
    }
    if (nextDir !== frameDirectionQueue[frameDirectionQueue.length - 1] && nextDir !== -1) {
        frameDirectionQueue.push(nextDir)
        console.log("frameDirectionQueue: ", frameDirectionQueue)
    }
});