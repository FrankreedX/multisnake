import React, {useEffect, useRef} from "react";

let body_parts = [
    {
        '01': {"background-image": "assets/snakes/red-snake/90_degree_turn_red.png", "transform": Math.PI / 2},
        '02': {"background-image": "assets/snakes/red-snake/body_red.png", "transform": 0},
        '03': {"background-image": "assets/snakes/red-snake/90_degree_turn_red.png", "transform": 0},
        '12': {"background-image": "assets/snakes/red-snake/90_degree_turn_red.png", "transform": Math.PI},
        '13': {"background-image": "assets/snakes/red-snake/body_red.png", "transform": Math.PI / 2},
        '23': {"background-image": "assets/snakes/red-snake/90_degree_turn_red.png", "transform": 3 * Math.PI / 2}
    },
    {
        '01': {"background-image": "assets/snakes/blue-snake/90_degree_turn_blue.png", "transform": Math.PI / 2},
        '02': {"background-image": "assets/snakes/blue-snake/body_blue.png", "transform": 0},
        '03': {"background-image": "assets/snakes/blue-snake/90_degree_turn_blue.png", "transform": 0},
        '12': {"background-image": "assets/snakes/blue-snake/90_degree_turn_blue.png", "transform": Math.PI},
        '13': {"background-image": "assets/snakes/blue-snake/body_blue.png", "transform": Math.PI / 2},
        '23': {"background-image": "assets/snakes/blue-snake/90_degree_turn_blue.png", "transform": 3 * Math.PI / 2}
    }
]

let square_size
let backgroundColor = "black"
let foodColor = "Green"
let nextFoodColor = "#004000"
let guideColor = "DimGray"

const Canvas = (props) => {
    const canvasReference = useRef(null)
    useEffect(()=>{
        const canvas = canvasReference.current
        const canvasContext = canvas.getContext('2d')
        square_size = Math.min(props.gameState.boardCol/canvas.width, props.gameState.boardRow/canvas.height)

        for (let snakes in body_parts) {
            for (let directions in snakes) {
                snakes[directions]["loaded-image"] = new Image(square_size, square_size)
                snakes[directions]["loaded-image"].src = snakes[directions]["background-image"]
            }
        }
    })
    //loop through each snakes
    for (let i = 0; i < props.gameState.snakes.length; i++) {
        let direction
        let snake = props.gameState.snakes[i].body_coords //array of snake body segments

        //colors grey guide lines
        for (let c = 0; c < boardRow; c++) {
            setColor(canvas, context, c, snake[0][1], guideColor)
        }
        for (let c = 0; c < boardCol; c++) {
            setColor(canvas, context, snake[0][0], c, guideColor)
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
        gridItems[coord].style.setProperty("background-image", `url(${props.gameState.snakes[i].skin_tail[i]})`)
        //apply style to head segment
        coord = coordToStraight(snake[0][0], snake[0][1])
        gridItems[coord].style.setProperty("transform", `rotate(${0.25 * props.gameState.snakes[i].direction}turn)`)
        gridItems[coord].style.setProperty("background-image", `url(${props.gameState.snakes[i].skin_head[i]})`)
        //HUNTER MODE
        if (props.gameState.snakes[i].advantage_point === 5) {
            setColor(canvas, context, snake[0][0], snake[0][1], "yellow")
            for (let j = props.gameState.snakes[1 - i].body_coords.length - 1; j > props.gameState.snakes[1 - i].body_coords.length - 5; j--) {
                setColor(canvas, context, props.gameState.snakes[1 - i].body_coords[j][0], props.gameState.snakes[1 - i].body_coords[j][1], "yellow")
            }
        }
    }
    //apply style to food and nextFood
    if (props.gameState.food !== undefined)
        setColor(canvas, context, props.gameState.food[0], props.gameState.food[1], foodColor)
    if (props.gameState.nextFood !== undefined) {
        setColor(canvas, context, props.gameState.nextFood[0], props.gameState.nextFood[1], nextFoodColor)
    }

    return (
        <div id="canvas-container">
            <canvas id="canvas" ref={canvasReference}></canvas>
        </div>
    );
}

function renderBoard(canvas, context, gameState){
    //clear canvas for redrawing
    context.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < gameState.snakes.length; i++) {
        let direction
        let snake = gameState.snakes[i].body_coords //array of snake body segments

        //colors grey guide lines
        for (let c = 0; c < gameState.boardRow; c++) {
            setColor(canvas, context, c, snake[0][1], guideColor)
        }
        for (let c = 0; c < gameState.boardCol; c++) {
            setColor(canvas, context, snake[0][0], c, guideColor)
            
        //loop through each segment
        }for (let c = 1; c < snake.length - 1; c++) {
            direction = ''
            //handles wraparound
            /***
             * consider the 2 pieces adjacent to the segment being processed (index c).
             * If the difference between the coordinates between any of the pairs being checked is larger than 2, one of them must be looped,
             * so add gameState.boardRow to any segment that are significantly smaller.
             */
            for (let a = -1; a < 2; a++) {
                for (let b = -1; b < 2; b++) {
                    if (Math.abs(snake[c + a][0] - snake[c + b][0]) > 2)
                        if (snake[c + a][0] < snake[c + b][0])
                            snake[c + a][0] += gameState.boardRow
                        else
                            snake[c + b][0] += gameState.boardRow
                    if (Math.abs(snake[c + a][1] - snake[c + b][1]) > 2)
                        if (snake[c + a][1] < snake[c + b][1])
                            snake[c + a][1] += gameState.boardCol
                        else
                            snake[c + b][1] += gameState.boardCol
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
                if (snake[c + a][0] >= gameState.boardRow)
                    snake[c + a][0] -= gameState.boardRow

                if (snake[c + a][1] >= gameState.boardCol)
                    snake[c + a][1] -= gameState.boardCol
            }
            //draw snake body sprite
            drawPicture(canvas, context, snake[c][0] * square_size, snake[c][1] * square_size, body_parts[i][direction]["loaded-image"], body_parts[i][direction]["transform"])
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

        let tailSkin = new Image(square_size, square_size)
        tailSkin.src = gameState.snakes[i].skin_tail[i]
        drawPicture(canvas, context, snake[snake.length - 1][0], snake[snake.length - 1][1], tailSkin, (Math.PI/2) * direction)

        let headSkin = new Image(square_size, square_size)
        headSkin.src = gameState.snakes[i].skin_head[i]
        drawPicture(canvas, context, snake[0][0], snake[0][1], headSkin, (Math.PI/2) * gameState.snakes[i].direction)

        //HUNTER MODE
        if (gameState.snakes[i].advantage_point === 5) {
            setColor(canvas, context, snake[0][0], snake[0][1], "yellow")
            for (let j = gameState.snakes[1 - i].body_coords.length - 1; j > gameState.snakes[1 - i].body_coords.length - 5; j--) {
                setColor(canvas, context, gameState.snakes[1 - i].body_coords[j][0], gameState.snakes[1 - i].body_coords[j][1], "yellow")
            }
        }
    }
}

function setColor(canvas, context, x, y, color){
    context.fillStyle = color
    let coords = [x * square_size, y * square_size]
    context.fillRect(coords[0], coords[1], coords[0] + square_size, coords[1] + square_size)
}

function drawPicture(canvas, context, x, y, image, transform){
    let width = image.width
    let height = image.height
    context.translate(x, y);
    context.rotate(transform);
    context.drawImage(image, -width / 2, -height / 2, width, height);
    context.rotate(-transform);
    context.translate(-x, -y);
}

export default Canvas;