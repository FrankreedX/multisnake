import React from 'react';
import { useNavigate } from "react-router-dom"
import Button from '../components/Buttons';

const Home = () => {
    const navigate = useNavigate();
    return(
        <div id='home'>
            <div className='left'>

            </div>
            <div className='center'>
                <div id="home-menu">
                    <Button onClick={()=>{navigate("/game")}} buttonStyle="large-button" buttonSize="matchmake-button">
                        MATCHMAKE
                    </Button>
                </div>
            </div>
            <div className='right'>

            </div>
        </div>
    );
}

export default Home;