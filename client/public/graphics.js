let playfield
let gridItems
let countdown
let foodCount
let frames
let gameEnd
let debug
let player1Score
let player2Score
let deuceText
let player1Img
let player2Img
let player1Name
let player2Name

let userProfile

function coordToStraight(row, col) {
    return row * boardCol + col
}

//load dom elements into variables
window.onload = async () => {
    playfield = document.getElementById("playfield")
    gridItems = playfield.getElementsByClassName("grid-item")
    countdown = document.getElementById("countdown")
    foodCount = document.getElementById("foodcount")
    frames = document.getElementById("frames")
    debug = document.getElementById("debug").value
    gameEnd = document.getElementById("gameEnd")
    player1Score = document.getElementById("player1Score")
    player2Score = document.getElementById("player2Score")
    deuceText = document.getElementById("deuceText")
    player1Img = document.getElementById("player1Img")
    player2Img = document.getElementById("player2Img")
    player1Name = document.getElementById("player1Name")
    player2Name = document.getElementById("player2Name")

    //tell CSS the dimension of the gameboard so it can line them up
    playfield.style.setProperty('--grid-rows', boardRow.toString());
    playfield.style.setProperty('--grid-cols', boardCol.toString());
    //spawn divs and color them
    for (let c = 0; c < boardRow * boardCol; c++) {
        let cell = document.createElement("div");
        cell.style.setProperty("background-color", "black")
        cell.className = "grid-item"
        playfield.appendChild(cell);
    }
    setIDBoard()
}

let backgroundColor = "black"
let foodColor = "Green"
let nextFoodColor = "#004000"
let guideColor = "DimGray"

//CALLED EVERY FRAME
socket.on('snake update', (game) => {
    console.log('snake update')
    gameState = game
    foodCount.textContent = "Food count: " + gameState.foodCounter
    if (!debug)
        frames.textContent = "FPS: " + (15 + Math.floor(gameState.foodCounter))

    currentFrame = gameState.frame
    console.log("rendering frame " + gameState.frame)
    console.log("snake1 head: " + gameState.snakes[0].body_coords[0])
    console.log("snake2 head: " + gameState.snakes[1].body_coords[0])
    renderBoard()
})

//GRAPHICS
let currentFrame = 0
socket.on('initial countdown', async (num) => {
    countdown.textContent = "Countdown: " + num
    if (num === 3) {
        for (let c = 0; c < (boardRow * boardCol); c++) {
            gridItems[c].style.setProperty("background-color", backgroundColor)
        }
        online = true
    }
    if (num <= 2) {
        renderBoard()
    }
    if (num === 0) {
        frameDirectionQueue = []
    }
})

socket.on('game ended', (winner) => {
    console.log(winner)
    gameEnd.textContent = 'Winner: ' + winner[0].winner + '.' + winner[0].reason
    setIDBoard()
})

socket.on('game score', (game, player1, player2) => {
    gameState = game
    player1Score.textContent = gameState.snakes[0].game_score
    player2Score.textContent = gameState.snakes[1].game_score
    console.log("setting players: ", player1, player2)
    player1Img.src = player1.picture
    player1Name.textContent = player1.name
    player2Img.src = player2.picture
    player2Name.textContent = player2.name
    if (gameState.deuce)
        deuceText.textContent = "Deuce!"
    else
        deuceText.textContent = ""

})

socket.on('match ended', (winner) => {
    if (winner.winner === 1) {
        player1Score.textContent = "WIN: " + gameState.snakes[0].game_score
    } else {
        player2Score.textContent = "WIN: " + gameState.snakes[1].game_score
    }
})

socket.on("refresh", () => {
    console.log("refreshing")
    window.location.reload()
})

//array of sprites
/*
direction designations
    0
    ^
    |
3 <- -> 1
    |
    V
    2
 */
let body_parts = [
    {
        '01': {"background-image": "url(Assets/90_degree_turn_red.png)", "transform": "rotate(0.25turn)"},
        '02': {"background-image": "url(Assets/body_red.png)"},
        '03': {"background-image": "url(Assets/90_degree_turn_red.png)", "transform": "rotate(0turn)"},
        '12': {"background-image": "url(Assets/90_degree_turn_red.png)", "transform": "rotate(0.5turn)"},
        '13': {"background-image": "url(Assets/body_red.png)", "transform": "rotate(0.25turn)"},
        '23': {"background-image": "url(Assets/90_degree_turn_red.png)", "transform": "rotate(0.75turn)"}
    },
    {
        '01': {"background-image": "url(Assets/90_degree_turn_blue.png)", "transform": "rotate(0.25turn)"},
        '02': {"background-image": "url(Assets/body_blue.png)"},
        '03': {"background-image": "url(Assets/90_degree_turn_blue.png)", "transform": "rotate(0turn)"},
        '12': {"background-image": "url(Assets/90_degree_turn_blue.png)", "transform": "rotate(0.5turn)"},
        '13': {"background-image": "url(Assets/body_blue.png)", "transform": "rotate(0.25turn)"},
        '23': {"background-image": "url(Assets/90_degree_turn_blue.png)", "transform": "rotate(0.75turn)"}
    }
]

function renderBoard() {
    //scoreboard dots
    let difference = gameState.snakes[1].advantage_point - gameState.snakes[0].advantage_point
    if (difference >= 0) {
        document.getElementById("redAdvBoard").textContent = ''
        document.getElementById("blueAdvBoard").textContent = '●'.repeat(difference)
    } else {
        document.getElementById("blueAdvBoard").textContent = ''
        document.getElementById("redAdvBoard").textContent = '●'.repeat(-difference)
    }

    //Fill all cells with backgroundColor
    for (let c = 0; c < boardCol * boardRow; c++) {
        let item = gridItems[c].style
        item.setProperty("background-color", backgroundColor)
        item.removeProperty("background-image")
        item.removeProperty("transform")
    }
    //colors grey guide lines
    // for (let i = 0; i < gameState.snakes.length; i++) {
    //     let snake = gameState.snakes[i].body_coords[0]
    //     for (let c = 0; c < boardRow; c++) {
    //         setColor(c, snake[1], guideColor)
    //     }
    //     for (let c = 0; c < boardCol; c++) {
    //         setColor(snake[0], c, guideColor)
    //     }
    // }
    //loop through each snakes
    for (let i = 0; i < gameState.snakes.length; i++) {
        let direction
        let snake = gameState.snakes[i].body_coords //array of snake body segments

        //colors grey guide lines
        for (let c = 0; c < boardRow; c++) {
            setColor(c, snake[0][1], guideColor)
        }
        for (let c = 0; c < boardCol; c++) {
            setColor(snake[0][0], c, guideColor)
        }
        //loop through each segment
        for (let c = 1; c < snake.length - 1; c++) {
            direction = ''
            //handles wraparound
            /***
             * consider the 2 pieces adjacent to the segment being processed (index c).
             * If the difference between the coordinates between any of the pairs being checked is larger than 2, one of them must be looped,
             * so add boardRow to any segment that are significantly smaller.
             */
            for (let a = -1; a < 2; a++) {
                for (let b = -1; b < 2; b++) {
                    if (Math.abs(snake[c + a][0] - snake[c + b][0]) > 2)
                        if (snake[c + a][0] < snake[c + b][0])
                            snake[c + a][0] += boardRow
                        else
                            snake[c + b][0] += boardRow
                    if (Math.abs(snake[c + a][1] - snake[c + b][1]) > 2)
                        if (snake[c + a][1] < snake[c + b][1])
                            snake[c + a][1] += boardCol
                        else
                            snake[c + b][1] += boardCol
                }
            }
            //designate what sprite will be at the segment c.
            if (snake[c][0] === snake[c - 1][0]) {
                if (snake[c - 1][1] > snake[c][1]) {
                    direction += '1'
                } else {
                    direction += '3'
                }
            } else if (snake[c - 1][0] > snake[c][0]) {
                direction += '2'
            } else {
                direction += '0'
            }
            if (snake[c][0] === snake[c + 1][0]) {
                if (snake[c + 1][1] > snake[c][1]) {
                    direction += '1'
                } else {
                    direction += '3'
                }
            } else if (snake[c + 1][0] > snake[c][0]) {
                direction += '2'
            } else {
                direction += '0'
            }
            if (direction[1] < direction[0]) {
                let temp0 = direction[0]
                let temp1 = direction[1]
                direction = temp1 + temp0
            }
            //reverses wraparound addition
            for (let a = -1; a < 2; a++) {
                if (snake[c + a][0] >= boardRow)
                    snake[c + a][0] -= boardRow

                if (snake[c + a][1] >= boardCol)
                    snake[c + a][1] -= boardCol
            }
            //apply the style from sprite array
            let keys = Object.keys(body_parts[i][direction])
            for (let j = 0; j < keys.length; j++) {
                let key = keys[j]
                gridItems[coordToStraight(snake[c][0], snake[c][1])].style.setProperty(`${key}`, body_parts[i][direction][key])
            }
        }
        //designate what sprite will be at the tail segment
        if (snake[snake.length - 1][0] === snake[snake.length - 2][0]) {
            if (snake[snake.length - 2][1] > snake[snake.length - 1][1]) {
                direction = 1
            } else {
                direction = 3
            }
        } else if (snake[snake.length - 2][0] > snake[snake.length - 1][0]) {
            direction = 2
        } else {
            direction = 0
        }
        //apply style to tail segment
        let coord = coordToStraight(snake[snake.length - 1][0], snake[snake.length - 1][1])
        gridItems[coord].style.setProperty("transform", `rotate(${0.25 * direction}turn)`)
        gridItems[coord].style.setProperty("background-image", `url(${gameState.snakes[i].skin_tail[i]})`)
        //apply style to head segment
        coord = coordToStraight(snake[0][0], snake[0][1])
        gridItems[coord].style.setProperty("transform", `rotate(${0.25 * gameState.snakes[i].direction}turn)`)
        gridItems[coord].style.setProperty("background-image", `url(${gameState.snakes[i].skin_head[i]})`)
        //HUNTER MODE
        if (gameState.snakes[i].advantage_point === 5) {
            setColor(snake[0][0], snake[0][1], "yellow")
            for (let j = gameState.snakes[1 - i].body_coords.length - 1; j > gameState.snakes[1 - i].body_coords.length - 5; j--) {
                setColor(gameState.snakes[1 - i].body_coords[j][0], gameState.snakes[1 - i].body_coords[j][1], "yellow")
            }
        }
    }
    //apply style to food and nextFood
    if (gameState.food !== undefined)
        setColor(gameState.food[0], gameState.food[1], foodColor)
    if (gameState.nextFood !== undefined) {
        setColor(gameState.nextFood[0], gameState.nextFood[1], nextFoodColor)
    }
}

function setColor(c0, c1, color) {
    let gridItem = gridItems[coordToStraight(c0, c1)]
    if (gridItem !== undefined)
        gridItem.style.setProperty("background-color", color)
}

function setIDBoard() {
    $.get('/profile', (data, status) => {
        console.log(status, "data: ", data)
        userProfile = data
        document.getElementById("username").textContent = userProfile.name
        document.getElementById("loggedInUser").setAttribute('src', userProfile.picture)
        document.getElementById("wins").textContent = 'Wins:' + userProfile.wins
        document.getElementById("loss").textContent = 'Losses: ' + userProfile.loss
        document.getElementById("elo").textContent = 'Elo: ' + userProfile.elo
    })
}