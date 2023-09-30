// dependencies
import React, {useEffect, useState} from 'react';
import { useNavigate } from "react-router-dom"

//components
import Button from '../components/Buttons';
import Score from '../components/Score'
import RoomID from '../components/RoomID';
import Canvas from '../components/Canvas';

const Game = (props) => {
    const navigate = useNavigate();
    const [gameState, setGameState] = useState({
        'boardCol': boardCol,
        'boardRow': boardRow,
        'roomPlayerNum': 2,
        'frame': 0,
        'framerate': 15,
        'food': [],
        'nextFood': [],
        'foodCounter': 0,
        'snakes': [],
        'gameFinished': false,
        'deuce': false,
        'matchFinished': false
    })

    useEffect(()=>{
        props.socket.on('get input', (game) => {
            setGameState(game)
            if (frameDirectionQueue.length > 0) {
                bufferedDirectionQueue = frameDirectionQueue
            }
            frameDirectionQueue = []
            let snakeDirection = gameState.snakes[gameState.playerSocketIDs.indexOf(props.socket.id)].direction
            let nextDir = bufferedDirectionQueue.shift()
            console.log("next Dir: ", nextDir)
            if ((nextDir !== undefined && nextDir !== null) && Math.abs(snakeDirection - nextDir) !== 2) {
                snakeDirection = nextDir
            }
            console.log("Sending direciton ", snakeDirection)
            props.socket.emit('send input', {dir: snakeDirection, frame: gameState.frame})
        })

        return ()=>{
            props.socket.off('get input')
        }
    })

    return(
        <div id='game'>
            <div className='left'>

            </div>
            <div className='center'>
                {/* <RoomID roomId="placeholder ID" /> */}
                <Score />
                <Canvas gameState={props.gameState} />
            </div>
            <div className='right'>
                
            </div>
        </div>
    );
}

export default Game;