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
    if(num === 0){
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
    for(let c = 0; c < boardCol * boardRow; c++){
        gridItems[c].style.setProperty("background-color", backgroundColor)
        gridItems[c].style.removeProperty("background-image")
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
    let snake_head = ['Assets/head_snake_red.png', 'Assets/head_snake_blue.png']
    let snake_tail = ['Assets/tail_red.png', 'Assets/tail_blue.png']
    let snake_direction = [gameState.snake1Direction, gameState.snake2Direction]
    let body_parts = [{'01': {"background-image": "url(Assets/90_degree_turn_red.png)", "transform": "rotate(0.25turn)"},
        '02': {"background-image": "url(Assets/body_red.png)"},
        '03': {"background-image": "url(Assets/90_degree_turn_red.png)", "transform": "rotate(0turn)"},
        '12': {"background-image": "url(Assets/90_degree_turn_red.png)", "transform": "rotate(0.5turn)"},
        '13': {"background-image": "url(Assets/body_red.png)", "transform": "rotate(0.25turn)"},
        '23': {"background-image": "url(Assets/90_degree_turn_red.png)", "transform": "rotate(0.75turn)"}},
        {'01': {"background-image": "url(Assets/90_degree_turn_blue.png)", "transform": "rotate(0.25turn)"},
        '02': {"background-image": "url(Assets/body_blue.png)"},
        '03': {"background-image": "url(Assets/90_degree_turn_blue.png)", "transform": "rotate(0turn)"},
        '12': {"background-image": "url(Assets/90_degree_turn_blue.png)", "transform": "rotate(0.5turn)"},
        '13': {"background-image": "url(Assets/body_blue.png)", "transform": "rotate(0.25turn)"},
        '23': {"background-image": "url(Assets/90_degree_turn_blue.png)", "transform": "rotate(0.75turn)"}}
    ]
    for(let i = 0; i < snakes.length; i++) {
        let direction = ''
        for (let c = 1; c < snakes[i].length - 1; c++) {
            direction = ''
            for(let a = -1; a < 2; a++){
                for(let b = -1; b < 2; b++){
                    if(Math.abs(snakes[i][c + a][0] - snakes[i][c + b][0]) > 2)
                        if(snakes[i][c + a][0] < snakes[i][c + b][0])
                            snakes[i][c + a][0] += boardRow
                        else
                            snakes[i][c + b][0] += boardRow
                    if(Math.abs(snakes[i][c + a][1] - snakes[i][c + b][1]) > 2)
                        if(snakes[i][c + a][1] < snakes[i][c + b][1])
                            snakes[i][c + a][1] += boardCol
                        else
                            snakes[i][c + b][1] += boardCol
                }
            }
            if(snakes[i][c][0] === snakes[i][c - 1][0]){
                if(snakes[i][c - 1][1] > snakes[i][c][1]){
                    direction += '1'
                } else {
                    direction += '3'
                }
            } else if(snakes[i][c - 1][0] > snakes[i][c][0]) {
                direction += '2'
            } else {
                direction += '0'
            }
                if (snakes[i][c][0] === snakes[i][c + 1][0]) {
                    if (snakes[i][c + 1][1] > snakes[i][c][1]) {
                        direction += '1'
                    } else {
                        direction += '3'
                    }
                } else if (snakes[i][c + 1][0] > snakes[i][c][0]) {
                    direction += '2'
                } else {
                    direction += '0'
                }
            console.log('direction: ', direction)
            if(direction[1] < direction[0]){
                console.log('in if')
                let temp0 = direction[0]
                let temp1 = direction[1]
                direction = temp1 + temp0
            }
            console.log('direction: ', direction)
            for(let a = -1; a < 2; a++){
                if(snakes[i][c + a][0] >= boardRow)
                    snakes[i][c + a][0] -= boardRow

                if(snakes[i][c + a][1] >= boardCol)
                    snakes[i][c + a][1] -= boardCol
            }
            let keys = Object.keys(body_parts[i][direction])
            for(let j = 0; j < keys.length; j++){
                let key = keys[j]
                console.log("C: ", c, " of snakes[i] ", i, " with coords ", snakes[i][c], " key: ", key, "property: ", body_parts[i][direction][key])
                gridItems[coordToStraight(snakes[i][c][0], snakes[i][c][1])].style.setProperty(`${key}`, body_parts[i][direction][key])
            }
        }
        if(snakes[i][snakes[i].length - 1][0] === snakes[i][snakes[i].length - 2][0]){
            if(snakes[i][snakes[i].length - 2][1] > snakes[i][snakes[i].length - 1][1]){
                direction = 1
            } else {
                direction = 3
            }
        } else if(snakes[i][snakes[i].length - 2][0] > snakes[i][snakes[i].length - 1][0]) {
            direction = 2
        } else {
            direction = 0
        }
        let coord = coordToStraight(snakes[i][snakes[i].length - 1][0], snakes[i][snakes[i].length - 1][1])
        gridItems[coord].style.setProperty("transform", `rotate(${0.25 * direction}turn)`)
        gridItems[coord].style.setProperty("background-image", `url(${snake_tail[i]})`)
        coord = coordToStraight(snakes[i][0][0], snakes[i][0][1])
        gridItems[coord].style.setProperty("transform", `rotate(${0.25 * snake_direction[i]}turn)`)
        gridItems[coord].style.setProperty("background-image", `url(${snake_head[i]})`)
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
    if(nextDir !== frameDirectionQueue[frameDirectionQueue.length - 1] && nextDir !== -1) {
        frameDirectionQueue.push(nextDir)
        console.log("frameDirectionQueue: ", frameDirectionQueue)
    }
});

function setColor(c0, c1, color){
    if(gridItems[coordToStraight(c0, c1)] !== undefined)
        gridItems[coordToStraight(c0, c1)].style.setProperty("background-color", color)
}
