let socket = io();
let roomid;
let gameState = {'gameFinished': false};

let playfield
let gridItems
let countdown
let foodCount
let frames
let gameEnd
let debug

let boardRow = 25
let boardCol = 50

let frameDirectionQueue = []
let bufferedDirectionQueue = []

function coordToStraight(row, col){
    return row * boardCol + col
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

window.onload = async()=>{
    playfield = document.getElementById("playfield");
    gridItems = playfield.getElementsByClassName("grid-item");
    countdown = document.getElementById("countdown");
    foodCount = document.getElementById("foodcount")
    frames = document.getElementById("frames")
    debug = document.getElementById("debug").value
    gameEnd = document.getElementById("gameEnd")

    playfield.style.setProperty('--grid-rows', boardRow.toString());
    playfield.style.setProperty('--grid-cols', boardCol.toString());
    for (let c = 0; c < boardRow * boardCol; c++) {
        let cell = document.createElement("div");
        cell.style.setProperty("background-color", "black")
        cell.className = "grid-item"
        playfield.appendChild(cell);
    }
}

let backgroundColor = "black"
let snake1Color = "Red"
let snake2Color = "Blue"
let foodColor = "Green"
let guideColor = "DimGray"

function createRoom(){
    socket.emit('createRoom', {'boardCol': boardCol, 'boardRow': boardRow, 'debugMode': debug})
    document.getElementById('roomid').textContent = "Room created: " + socket.id
}

function joinRoom(room){
    socket.emit('joinRoom', room)
}

function echoTest(message){
    socket.emit('echoTest', message)
}

function rematch(){
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

socket.on('snake update', (game) => {
    console.log('snake update')
    gameState = game
    foodCount.textContent = "Food count: " + gameState.foodCounter
    if(!debug)
    frames.textContent = "FPS: " + (15 + Math.floor(gameState.foodCounter))

    currentFrame = gameState.frame
    console.log("rendering frame " + gameState.frame)
    console.log("snake1 head: " + gameState.snake1[0])
    console.log("snake2 head: " + gameState.snake2[0])
    renderBoard()
})
let currentFrame = 0
socket.on('initial countdown', async (num) => {
    countdown.textContent = "Countdown: " + num
    if(num === 3){
        for (let c = 0; c < (boardRow * boardCol); c++) {
            gridItems[c].style.setProperty("background-color", backgroundColor)
        }
    }
    if(num === 2){
        renderBoard()
    }
    if(num === 1){
        frameDirectionQueue = []
    }
})

socket.on('get input', (game)=> {
    gameState = game
    if(frameDirectionQueue.length > 0){
        bufferedDirectionQueue = frameDirectionQueue
    }
    frameDirectionQueue = []
    let snakeDirection
    if(socket.id === gameState.player1id){
        console.log("player1 received direction", gameState.snake1Direction)
        snakeDirection = gameState.snake1Direction
    } else{
        console.log("player2 received direction", gameState.snake2Direction)
        snakeDirection = gameState.snake2Direction
    }
    let nextDir = bufferedDirectionQueue.shift()
    console.log("next Dir: ", nextDir)
    if((nextDir !== undefined && nextDir !== null) && Math.abs(snakeDirection - nextDir) !== 2){
        console.log("changing direction from ", snakeDirection, " to ", nextDir)
        snakeDirection = nextDir
    }
    console.log("Sending direciton ", snakeDirection)
    socket.emit('send input', {dir: snakeDirection, frame: gameState.frame})
})

socket.on('game ended', (winner) => {
    console.log(winner)
    gameEnd.textContent = 'Winner: ' + winner[0].winner + '.' + winner[0].reason
    gameState.gameFinished = true
})

function renderBoard(){
    // if(!gridItems)
    //     return
    for(let c = 0; c < boardCol * boardRow; c++){
        gridItems[c].style.setProperty("background-color", backgroundColor)
    }
    let snakes = [gameState.snake1, gameState.snake2]
    for(let i = 0; i < 2; i++) {
        let snake = snakes[i]
        for (let c = 0; c < boardRow; c++) {
            setColor(c, snake[0][1], guideColor)
        }
        for (let c = 0; c < boardCol; c++) {
            setColor(snake[0][0], c, guideColor)
        }
    }
    let color = [snake1Color, snake2Color]
    for(let i = 0; i < snakes.length; i++) {
        let snake = snakes[i]
        for (let c = 0; c < snake.length; c++) {
            setColor(snake[c][0], snake[c][1], color[i])
        }
    }
    if(gameState.food !== undefined)
        setColor(gameState.food[0], gameState.food[1], foodColor)
}

document.addEventListener('keydown', function(event) {
    let nextDir = -1
    switch(event.key){
        case "ArrowUp":
        case "w":
        case "W":
            nextDir = 0
            console.log('Up was pressed');
            break;
        case "ArrowLeft":
        case "a":
        case "A":
            nextDir = 1
            console.log('Left was pressed');
            break;
        case "ArrowDown":
        case "s":
        case "S":
            nextDir = 2
            console.log('Down was pressed');
            break;
        case "ArrowRight":
        case "d":
        case "D":
            nextDir = 3
            console.log('Right was pressed');
            break;
    }
    if(nextDir !== frameDirectionQueue[frameDirectionQueue.length - 1] && nextDir !== -1) {
        frameDirectionQueue.push(nextDir)
        console.log("frameDirectionQueue: ", frameDirectionQueue)
    }
});

function setColor(c0, c1, color){
    if(gridItems[coordToStraight(c0, c1)] !== undefined)
        gridItems[coordToStraight(c0, c1)].style.setProperty("background-color", color)
}
