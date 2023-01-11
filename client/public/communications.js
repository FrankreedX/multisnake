let socket = io();
let roomid;

let boardRow = 25
let boardCol = 50

let gameState = {
    'boardCol': boardCol,
    'boardRow': boardRow,
    'roomPlayerNum': 2,
    'frame': 0,
    'framerate': 15,
    'food': [],
    'nextFood': [],
    'foodCounter': 0,
    'snakes': [],
    'gameFinished': false,
    'deuce': false,
    'matchFinished': false
};
let removeControlListener

let frameDirectionQueue = []
let frameDirectionQueuePlayer2 = []
let bufferedDirectionQueue = []

let online = true

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
    let snakeDirection = gameState.snakes[gameState.playerSocketIDs.indexOf(socket.id)].direction
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
    let player1 = true
    switch (event.key) {
        case "ArrowUp":
            player1 = false
        case "w":
        case "W":
            nextDir = 0
            console.log('Up was pressed');
            break;

        case "ArrowRight":
            player1 = false
        case "d":
        case "D":
            nextDir = 1
            console.log('Right was Pressed');
            break;

        case "ArrowDown":
            player1 = false
        case "s":
        case "S":
            nextDir = 2
            console.log('Down was pressed');
            break;

        case "ArrowLeft":
            player1 = false
        case "a":
        case "A":
            nextDir = 3
            console.log('Left was pressed');
            break;
    }
    if (nextDir === -1)
        return
    if (online || player1) {
        if (nextDir !== frameDirectionQueue[frameDirectionQueue.length - 1]) {
            frameDirectionQueue.push(nextDir)
            console.log("frameDirectionQueue: ", frameDirectionQueue)
        }
    } else if (nextDir !== frameDirectionQueuePlayer2[frameDirectionQueuePlayer2.length - 1]) {
            frameDirectionQueuePlayer2.push(nextDir)
            console.log("frameDirectionQueuePlayer2: ", frameDirectionQueuePlayer2)
        }
})