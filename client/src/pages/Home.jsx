import React from 'react';
import {useNavigate} from "react-router-dom"
import Button from '../components/Buttons';
import TextBox from "../components/TextBox";

const Home = () => {
    const navigate = useNavigate();
    return (
        <div id='home'>
            <div className='left'>

            </div>
            <div className='center'>
                <div id="home-menu">
                    <Button
                        onClick={() => {
                            socket.emit('createRoom', {'boardCol': boardCol, 'boardRow': boardRow, 'debugMode': debug});
                            navigate("/game")
                        }}
                        buttonStyle="large-button"
                        buttonSize="matchmake-button">
                        CREATE ROOM
                    </Button>
                    <TextBox id="roomidToJoin" label="Room ID to join" name="roomidToJoin" defaultText="RoomID to Join"
                             elemntClass=""></TextBox>
                    <Button onClick={() => {
                        navigate("/game");
                        joinRoom(document.getElementById('roomidToJoin').value)
                    }} buttonStyle="large-button" buttonSize="matchmake-button">
                        JOIN ROOM
                    </Button>
                </div>
            </div>
            <div className='right'>

            </div>
        </div>
    );
}

export default Home;