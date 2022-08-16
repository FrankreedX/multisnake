function spawnFood(gameState) {
    let validCoords = false
    let row = 0
    let col = 0
    mainLoopRow:
        while (!validCoords) {
            row = Math.floor(Math.random() * gameState.boardRow)
            col = Math.floor(Math.random() * gameState.boardCol)
            for (let n = 0; n < gameState.snakes.length; n++) {
                for (let i = 0; i < gameState.snakes[n].body_coords.length; i++) {
                    if (row === gameState.snakes[n].body_coords[i][0] && col === gameState.snakes[n].body_coords[i][1])
                        continue mainLoopRow
                }
            }
            validCoords = true
        }
    gameState.nextFood = [row, col]
}

function shiftFood(gameState) {
    gameState.food = gameState.nextFood
    spawnFood(gameState)
}

function coordEqual(coord1, coord2) {
    return coord1[0] === coord2[0] && coord1[1] === coord2[1]
}

function dirToCoord(gameState, direction, coord) {
    let coordinate = JSON.parse(JSON.stringify(coord));
    switch (direction) {
        case 0: //up
            coordinate[0]--
            if (coordinate[0] < 0)
                coordinate[0] += gameState.boardRow
            break
        case 1: //right
            coordinate[1]++
            if (coordinate[1] >= gameState.boardCol)
                coordinate[1] -= gameState.boardCol
            break
        case 2: //down
            coordinate[0]++
            if (coordinate[0] >= gameState.boardRow)
                coordinate[0] -= gameState.boardRow
            break
        case 3: //left
            coordinate[1]--
            if (coordinate[1] < 0)
                coordinate[1] += gameState.boardCol
            break
    }
    return coordinate
}

function processGameTurn(broadcaster, gameState) {
    console.log("directions for frame ", gameState.frame)
    let nextHead = []
    for (let n = 0; n < gameState.snakes.length; n++) {
        console.log(`Snake ${n + 1}'s direction: `, gameState.snakes[n].direction)
        console.log(`Snake ${n + 1}'s head: `, gameState.snakes[n].body_coords[0])
        nextHead.push(dirToCoord(gameState, gameState.snakes[n].direction, gameState.snakes[n].body_coords[0]))
        console.log(`Next head ${n + 1}: `, nextHead[n])
    }
    console.log('Food: ', gameState.food)
    console.log('nextFood: ', gameState.nextFood)
    let gameEndObj = []
    for (let n = 0; n < gameState.snakes.length - 1; n++) {
        for (let m = n + 1; m < gameState.snakes.length; m++) {
            if (coordEqual(nextHead[n], nextHead[m])) {
                gameEndObj.push({'winner': 0})
                console.log('tie. player 1 and player 2 collided')
                broadcaster.emit('game ended', gameEndObj)
                gameState.gameFinished = true
                return
            }
        }
    }
    collision_loop:
        for (let n = 0; n < gameState.snakes.length; n++) {
            for (let m = 0; m < nextHead.length; m++) {
                for (let i = 0; i < gameState.snakes[n].body_coords.length; i++) {
                    if (coordEqual(nextHead[m], gameState.snakes[n].body_coords[i])) {
                        if (gameState.snakes[m].advantage_point === 5 && i > gameState.snakes[n].body_coords.length - 5) {
                            gameEndObj.push({'winner': 3 - m, 'reason': `player ${m + 1} ate player ${n + 1}'s tail`})
                            break collision_loop
                        }
                        m++
                        n++
                        if (m === n) {
                            gameEndObj.push({'winner': 3 - m, 'reason': `player ${m} collided with itself`})
                            console.log(`player ${3 - m} wins. player ${m} self collided`)
                        } else {
                            gameEndObj.push({'winner': n, 'reason': `player ${m} collided with player ${n}`})
                            console.log(`player ${n} wins. player ${m} collided with player ${n}`)
                        }
                        n--
                        m--
                        break collision_loop
                    }
                }
            }
        }
    if (gameEndObj.length === 1) {
        broadcaster.emit('game ended', gameEndObj)
        gameState.gameFinished = true
        gameState.snakes[gameEndObj[0].winner - 1].game_score++
        if (gameState.snakes[gameEndObj[0].winner - 1].advantage_point === 5)
            gameState.snakes[gameEndObj[0].winner - 1].game_score++
        return
    }
    if (gameEndObj.length > 1) {
        gameEndObj = [{'winner': 0, 'reason': 'player 1 and player 2 collided at the same time'}]
        console.log('tie. player 1 and player 2 collided at the same time')
        console.log(gameEndObj)
        broadcaster.emit('game ended', gameEndObj)
        gameState.gameFinished = true
        return
    }
    for (let n = 0; n < gameState.snakes.length; n++) {
        gameState.snakes[n].body_coords.unshift(nextHead[n])

        if (coordEqual(nextHead[n], gameState.food)) {
            shiftFood(gameState)
            gameState.foodCounter++
            if (gameState.snakes[1 - n].advantage_point > 0)
                gameState.snakes[1 - n].advantage_point--
            else if (gameState.snakes[n].advantage_point < 5)
                gameState.snakes[n].advantage_point++
        } else {
            if (coordEqual(nextHead[n], gameState.nextFood)) {
                spawnFood(gameState)
            }
            gameState.snakes[n].body_coords.pop()
        }
    }
}

module.exports = {
    spawnFood: spawnFood,
    shiftFood: shiftFood,
    play: processGameTurn,
}
