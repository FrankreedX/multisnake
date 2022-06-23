let socket = io();
let roomid;
let gameState = {'gameFinished': false};

let playfield
let gridItems
let countdown
let foodCount
let frames
let gameEnd

let boardRow = 50
let boardCol = 100

let snextDirection = [0]

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
    socket.emit('createRoom', {'boardCol': boardCol, 'boardRow': boardRow})
    document.getElementById('roomid').textContent = "Room created: " + socket.id
}

function joinRoom(room){
    socket.emit('joinRoom', room)
}

function rematch(){
    socket.emit('rematch')
}

socket.on('room created', (room) => {
    roomid = room
})

socket.on('snake update', (game) => {
    gameState = game
    foodCount.textContent = "Food count: " + gameState.foodCounter
    frames.textContent = "FPS: " + (15 + Math.floor(gameState.foodCounter/10))
})

socket.on('initial countdown', async (num) => {
    countdown.textContent = "Countdown: " + num
    if(num === 3){
        for (let c = 0; c < (boardRow * boardCol); c++) {
            gridItems[c].style.setProperty("background-color", backgroundColor)
        }
    }
    if(num === 2){
        while(true) {
            let time = new Date()
            renderBoard()
            await sleep(1000/60 - (time - new Date()))
        }
    }
})

socket.on('input', (game)=> {
    gameState = game
    let snakeDirection
    if(socket.id === gameState.player1id){
        snakeDirection = gameState.snake1Direction
    } else{
        snakeDirection = gameState.snake2Direction
    }
    let nextDir = snextDirection.shift()
    console.log("next Dir: ", nextDir)
    if((nextDir !== undefined && nextDir !== null) && Math.abs(snakeDirection - nextDir) !== 2) // no going backwards
        snakeDirection = nextDir
    console.log("Sending direciton ", snakeDirection)
    socket.emit('input', snakeDirection)
})

socket.on('game ended', (winner) => {
    console.log(winner)
    gameEnd.textContent = 'Winner: ' + winner[0].winner + '.' + winner[0].reason
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
    if(event.shiftKey){
        snextDirection = []
    }
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
    if(nextDir !== snextDirection[snextDirection.length - 1] && nextDir !== -1) {
        snextDirection.push(nextDir)
        console.log("snextdirection: ", snextDirection)
    }
});

function setColor(c0, c1, color){
    if(gridItems[coordToStraight(c0, c1)] !== undefined)
        gridItems[coordToStraight(c0, c1)].style.setProperty("background-color", color)
}
