function spawnFood(gameState) {
    let validCoords = false
    let row = 0
    let col = 0
    mainLoopRow:
        while (!validCoords) {
            row = Math.floor(Math.random() * gameState.boardRow)
            col = Math.floor(Math.random() * gameState.boardCol)
            for(let n = 0; n < gameState.snakes.length; n++) {
                for (let i = 0; i < gameState.snakes[n].body_coords.length; i++) {
                    if (row === gameState.snakes[n].body_coords[i][0] && col === gameState.snakes[n].body_coords[i][1])
                        continue mainLoopRow
                }
            }
            validCoords = true
        }
    gameState.food = [row, col]
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

function processGameTurn(broacaster, gameState) {
    console.log("directions for frame ", gameState.frame)
    let nextHead = []
    for(let n = 0; n < gameState.snakes.length; n++){
        console.log(`Snake ${n + 1}'s direction: `, gameState.snakes[n].direction)
        console.log(`Snake ${n + 1}'s head: `, gameState.snakes[n].body_coords[0])
        nextHead.push(dirToCoord(gameState, gameState.snakes[n].direction, gameState.snakes[n].body_coords[0]))
        console.log(`Next head ${n + 1}: `, nextHead[n])
    }
    console.log('Total nextHead: ', nextHead)
    let gameEndObj = []
    for(let n = 0; n < gameState.snakes.length - 1; n++){
        for(let m = n + 1; m < gameState.snakes.length; m++){
            if (coordEqual(nextHead[n], nextHead[m])) {
                gameEndObj.push({'winner': 'tie'})
                console.log('tie. player 1 and player 2 collided')
                broacaster.emit('game ended', gameEndObj)
                gameState.gameFinished = true
                return
            }
        }
    }
    for(let n = 0; n < gameState.snakes.length; n++){
        for(let m = 0; m < nextHead.length; m++) {
            for (let i = 0; i < gameState.snakes[n].body_coords.length; i++) {
                if (coordEqual(nextHead[m], gameState.snakes[n].body_coords[i])) {
                    m++
                    n++
                    if(m === n) {
                        gameEndObj.push({'winner': `player ${3 - m}`, 'reason': `player ${m} collided with itself`})
                        console.log(`player ${3 - m} wins. player ${m} self collided`)
                    } else {
                        gameEndObj.push({'winner': `player ${n}`, 'reason': `player ${m} collided with player ${n}`})
                        console.log(`player ${n} wins. player ${m} collided with player ${n}`)
                    }
                    n--
                    m--
                }
            }
        }
    }
    if (gameEndObj.length === 1) {
        broacaster.emit('game ended', gameEndObj)
        gameState.gameFinished = true
        return
    }
    if (gameEndObj.length > 1) {
        gameEndObj = [{'winner': 'tie'}]
        console.log('tie. player 1 and player 2 collided at the same time')
        console.log(gameEndObj)
        broacaster.emit('game ended', gameEndObj)
        gameState.gameFinished = true
        return
    }
    for(let n = 0; n < gameState.snakes.length; n++){
        gameState.snakes[n].body_coords.unshift(nextHead[n])

        if (coordEqual(nextHead[n], gameState.food)) {
            spawnFood(gameState)
            gameState.foodCounter++
        } else {
            gameState.snakes[n].body_coords.pop()
        }
    }
}

module.exports = {
    spawnFood: spawnFood,
    play: processGameTurn,
}
