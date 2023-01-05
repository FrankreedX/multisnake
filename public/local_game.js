async function startLocal(){ //contains game logic for a local 2 player game
    console.log("starting local")
    online = false
    //countdown
    //3
    for (let c = 0; c < (boardRow * boardCol); c++) {
        gridItems[c].style.setProperty("background-color", backgroundColor)
    }
    await sleep(1000)
    //2
    await resetGame(gameState)
    renderBoard()
    await sleep(1000)
    //1
    await spawnFood(gameState)
    await shiftFood(gameState)
    renderBoard()
    await sleep(1000)

    while(true){
        let time = new Date()
        if(frameDirectionQueue.length > 0 && Math.abs(frameDirectionQueue[0] - gameState.snakes[0].direction) !== 2){
            gameState.snakes[0].direction = frameDirectionQueue[0]
        }
        if(frameDirectionQueuePlayer2.length > 0 && Math.abs(frameDirectionQueuePlayer2[0] - gameState.snakes[1].direction) !== 2){
            console.log("changing player 2's direction")
            gameState.snakes[1].direction = frameDirectionQueuePlayer2[0]
        }
        frameDirectionQueue = []
        frameDirectionQueuePlayer2 = []
        if(processGameTurn(gameState) !== undefined){
            break
        }
        renderBoard()
        time = new Date() - time
        await sleep(1000 / gameState.framerate - time)
    }
}