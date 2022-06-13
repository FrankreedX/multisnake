window.onload = init;

let playfield;
let gridItems
let dirList
let dir
let boardCol = 100
let boardRow = 50

let snake = []
let food = []
let foodCounter = 0
let snakeDirection = 0 //0 is up, 1 is left, 2 is down, 3 is right
let snextDirection = [0]

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
    snextDirection.push(nextDir)
});
for(let i = 0; i < 15; i++){
    snake.push([boardRow/2 + i, boardRow / 2])
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function init() {
    playfield = document.getElementById("playfield");
    gridItems = playfield.getElementsByClassName("grid-item")
    dirList = document.getElementById("dirlist")
    dir = document.getElementById("dir")

    spawnFood();

    playfield.style.setProperty('--grid-rows', boardRow.toString());
    playfield.style.setProperty('--grid-cols', boardCol.toString());
    for (let c = 0; c < (boardRow * boardCol); c++) {
        let cell = document.createElement("div");
        cell.style.setProperty("background-color", "black")
        playfield.appendChild(cell).className = "grid-item";
        if(c === boardRow * boardCol){
            renderBoard()
        }
    }
    await sleep(2000);
    console.log("game started")
    await play();
}

async function play(){
    let alive = true
    let nextHead = []
    while(alive){
        let time = new Date();
        nextHead = Object.assign([], snake[0])
        let nextDir = snextDirection.shift()
        dirList.textContent = "Next direction: " + snextDirection
        if(nextDir !== undefined && Math.abs(snakeDirection - nextDir) !== 2) // no going backwards
            snakeDirection = nextDir
        switch(snakeDirection){
            case 0: //up
                nextHead[0]--
                if(nextHead[0] < 0)
                    nextHead[0] += boardRow
                break
            case 1: //left
                nextHead[1]--
                if(nextHead[1] < 0)
                    nextHead[1] += boardCol
                break
            case 2: //down
                nextHead[0]++
                if(nextHead[0] >= boardRow)
                    nextHead[0] -= boardRow
                break
            case 3: //right
                nextHead[1]++
                if(nextHead[1] >= boardCol)
                    nextHead[1] -= boardCol
                break
        }

        for(let i = 2; i < snake.length; i++){
            if(coordEqual(nextHead, snake[i])){
                alert('snake died')
                return
            }
        }
        snake.unshift(nextHead)
        if(coordEqual(nextHead, food)){
            spawnFood()
            foodCounter++
            dir.textContent = foodCounter
            console.log("new length: ", snake.length)
        } else {
            snake.pop()
        }

        await renderBoard()
        time = new Date() - time
        await sleep(1000/(10 + foodCounter/2) - time)
    }
}

function coordEqual(coord1, coord2){
    return coord1[0] === coord2[0] && coord1[1] === coord2[1]
}

function coordToStraight(row, col){
    return row * boardCol + col
}

function spawnFood(){
    let validCoords = false
    let row = 0
    let col = 0
    mainLoopRow:
        while(!validCoords){
            row = Math.floor(Math.random() * boardRow)
            col = Math.floor(Math.random() * boardCol)
            for(let i = 0; i < snake.length; i++){
                if(row === snake[i][0] && col === snake[i][1])
                    continue mainLoopRow
            }
            validCoords = true
        }
    food = [row, col]
}

function setColor(c0, c1, color){
    if(gridItems[coordToStraight(c0, c1)] !== undefined)
        gridItems[coordToStraight(c0, c1)].style.setProperty("background-color", color)
}

function renderBoard(){
    if(!gridItems)
        return
    setColor(snake[snake.length - 1][0] + 1, snake[snake.length - 1][1], "black")
    setColor(snake[snake.length - 1][0], snake[snake.length - 1][1] + 1, "black")
    setColor(snake[snake.length - 1][0] - 1, snake[snake.length - 1][1], "black")
    setColor(snake[snake.length - 1][0], snake[snake.length - 1][1] - 1, "black")
    for(let c = 0; c < boardRow; c++){
        setColor(c, snake[1][1], "black")
    }
    for(let c = 0; c < boardCol; c++){
        setColor(snake[1][0], c, "black")
    }
    for(let c = 0; c < boardRow; c++){
        setColor(c, snake[0][1], "DimGray")
    }
    for(let c = 0; c < boardCol; c++){
        setColor(snake[0][0], c, "DimGray")
    }
    setColor(food[0], food[1], "blue")
    for(let c = 0; c < snake.length; c++){
        setColor(snake[c][0], snake[c][1], "red")
    }
}
