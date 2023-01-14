//dependencies
import React, { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import io from 'socket.io-client'

//styles
import './App.css';

//components
import Header from "./components/Header";
import Footer from "./components/Footer";

//pages
import Login from "./pages/Login";
import Home from "./pages/Home";
import Game from "./pages/Game";

const socket = io()

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
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

  // window dimensions

  const location = useLocation();

  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    headerHeight: null,
    footerHeight: null,
    mainBodyHeight: null
  })

  // resize components based on window dimensions
  useEffect(() => {
    socket.on('room created', (room) => {
      roomid = room
    })

    socket.on('echo', (message) => {
      console.log('client echoing', message)
    })

    socket.on('get input', (game) => {
      setGameState(game)
      if (frameDirectionQueue.length > 0) {
        bufferedDirectionQueue = frameDirectionQueue
      }
      frameDirectionQueue = []
      let snakeDirection = gameState.snakes[gameState.playerSocketIDs.indexOf(socket.id)].direction
      let nextDir = bufferedDirectionQueue.shift()
      console.log("next Dir: ", nextDir)
      if ((nextDir !== undefined && nextDir !== null) && Math.abs(snakeDirection - nextDir) !== 2) {
        snakeDirection = nextDir
      }
      console.log("Sending direciton ", snakeDirection)
      socket.emit('send input', {dir: snakeDirection, frame: gameState.frame})
    })

    console.log("handling resizing")
    window.addEventListener('load', handleResize);
    window.addEventListener('resize', handleResize);
    return _ => {
      window.removeEventListener('load', handleResize) //🤪
      window.removeEventListener('resize', handleResize)
    }
  }, [dimensions]);

  return (
    <div className="app" style={{height: dimensions.height}}>
      <Header />
      <div id="main-body" style={{height: dimensions.mainBodyHeight}}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/game" element={<Game />} />
          <Route path="*" element={<p>ERROR 404</p>} />
        </Routes>
      </div>
      <Footer />
    </div>
  );

  function handleResize() {

    console.log("handling resizing inside")
    let newHeaderHeight = document.getElementById("header").offsetHeight;
    let newFooterHeight = document.getElementById("footer").offsetHeight;

    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
      headerHeight: newHeaderHeight,
      footerHeight: newFooterHeight,
      mainBodyHeight: window.innerHeight - newHeaderHeight - newFooterHeight
    })
  }
}

export default App;
