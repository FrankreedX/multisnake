import React from 'react';
import {redirect, useNavigate} from "react-router-dom"
import Button from '../components/Buttons';

const Login = () => {
    const navigate = useNavigate();
    return(
        <div id='login'>
            <div className='login-menu'>
                <Button onClick={()=>{redirect("/oauth2")}} buttonStyle="large-button" buttonSize="login-button">
                    LOGIN WITH GOOGLE
                </Button>
                <Button onClick={()=>{navigate("/home")}} buttonStyle="large-button" buttonSize="login-button">
                    CONTINUE AS GUEST
                </Button>
            </div>
        </div>
    );
}

export default Login;
