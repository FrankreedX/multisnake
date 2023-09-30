export function createRoom(socket) {
    socket.emit('createRoom', {'boardCol': boardCol, 'boardRow': boardRow, 'debugMode': debug})
    document.getElementById('roomid').textContent = "Room created: " + socket.id
}

export function joinRoom(socket, room) {
    socket.emit('joinRoom', room)
}

export function echoTest(socket, message) {
    socket.emit('echoTest', message)
}

export function rematch(socket) {
    socket.emit('rematch')
}

export function updateFramerate(socket, fps) {
    socket.emit('updateFramerate', fps)
}


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
        '01': {"background-image": "assets/snakes/red-snake/90_degree_turn_red.png", "transform": Math.PI/2},
        '02': {"background-image": "assets/snakes/red-snake/body_red.png", "transform": 0},
        '03': {"background-image": "assets/snakes/red-snake/90_degree_turn_red.png", "transform": 0},
        '12': {"background-image": "assets/snakes/red-snake/90_degree_turn_red.png", "transform": Math.PI},
        '13': {"background-image": "assets/snakes/red-snake/body_red.png", "transform": Math.PI/2},
        '23': {"background-image": "assets/snakes/red-snake/90_degree_turn_red.png", "transform": 3*Math.PI/2}
    },
    {
        '01': {"background-image": "assets/snakes/blue-snake/90_degree_turn_blue.png", "transform": Math.PI/2},
        '02': {"background-image": "assets/snakes/blue-snake/body_blue.png", "transform": 0},
        '03': {"background-image": "assets/snakes/blue-snake/90_degree_turn_blue.png", "transform": 0},
        '12': {"background-image": "assets/snakes/blue-snake/90_degree_turn_blue.png", "transform": Math.PI},
        '13': {"background-image": "assets/snakes/blue-snake/body_blue.png", "transform": Math.PI/2},
        '23': {"background-image": "assets/snakes/blue-snake/90_degree_turn_blue.png", "transform": 3*Math.PI/2}
    }
]

for (let snakes in body_parts){
    for(let directions in snakes){
        snakes[directions]["loaded-image"] = new Image()
        snakes[directions]["loaded-image"].src = snakes[directions]["background-image"]
    }
}

export function renderBoard() {
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

export function setColor(c0, c1, color) {
    let gridItem = gridItems[coordToStraight(c0, c1)]
    if (gridItem !== undefined)
        gridItem.style.setProperty("background-color", color)
}

export function setIDBoard() {
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