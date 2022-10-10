import React from 'react';
import { useNavigate } from "react-router-dom"
import Button from '../components/Buttons';
import RoomID from '../components/RoomID';
import Canvas from '../components/Canvas';

const Game = () => {
    const navigate = useNavigate();
    return(
        <div id='game'>
            <div className='left'>

            </div>
            <div className='center'>
                {/* <RoomID roomId="placeholder ID" /> */}
                <Canvas />
            </div>
            <div className='right'>
                
            </div>
        </div>
    );
}

export default Game;