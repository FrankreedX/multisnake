import React from 'react';
import { renderMatches } from 'react-router-dom';
import Button from './Buttons';

const RoomID = ({ roomId }) => {
    return(
        <div id="room-id">
            <input type="text" value={roomId} className="copy-input" />
            <Button onClick={()=>{}} buttonStyle="copy-button">
                C
            </Button>
        </div>
    );
}

export default RoomID;