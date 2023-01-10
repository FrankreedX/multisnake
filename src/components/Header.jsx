import React, { useEffect, useState } from "react";
import { useLocation } from 'react-router-dom';

//components
import Button from './Buttons';

//importing header ui elemets
import logo from '../assets/icons/logo.svg';
import twitterIcon from '../assets/icons/twitter-icon.svg';
import githubIcon from '../assets/icons/github-icon.svg';
import emailIcon from '../assets/icons/email-icon.svg'

const Header = () => {

    const location = useLocation();
    const [headerStyle, setHeaderStyle] = useState({
        height: "7rem",
        padding: "2rem 3rem 1rem 3rem"
    });

    useEffect(() => {
        if(location.pathname === "/game"){
            setHeaderStyle({
                height: "4rem",
                padding: "1rem 3rem 0.5rem 3rem"
            })
        }else{
            setHeaderStyle({
                height: "7rem",
                padding: "2rem 3rem 1rem 3rem"
            })
        }
        
    }, [location])

    return (
        <div id="header" style={{height: headerStyle.height, padding: headerStyle.padding}}>
            <div id="logo">
                <img src={logo} alt="multisnake logo" />
            </div>
            <div id="header-ui-container">
                <Button onClick={()=>{openInNewTab("https://css-tricks.com/snippets/css/a-guide-to-flexbox/")}} buttonStyle="header-button">
                    <img src={twitterIcon} alt="link to twitter page"/>
                </Button>
                <Button onClick={()=>{openInNewTab("https://github.com/FrankreedX/multisnake")}} buttonStyle="header-button">
                    <img src={githubIcon} alt="link to github page"/>
                </Button>
                <Button onClick={()=>{openInNewTab("https://isotropic.co/react-multiple-pages/")}} buttonStyle="header-button">
                    <img src={emailIcon} alt="link to contact form"/>
                </Button>
            </div>
        </div>
    );
}

//opens tab in a new browser window
const openInNewTab = (url) => {
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
    if (newWindow) newWindow.opener = null
}

export default Header;