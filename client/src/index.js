import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter, browserRouter } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

document.addEventListener('keydown', function (event) {
    let nextDir = -1
    let player1 = true
    switch (event.key) {
        case "ArrowUp":
            player1 = false
        case "w":
        case "W":
            nextDir = 0
            console.log('Up was pressed');
            break;

        case "ArrowRight":
            player1 = false
        case "d":
        case "D":
            nextDir = 1
            console.log('Right was Pressed');
            break;

        case "ArrowDown":
            player1 = false
        case "s":
        case "S":
            nextDir = 2
            console.log('Down was pressed');
            break;

        case "ArrowLeft":
            player1 = false
        case "a":
        case "A":
            nextDir = 3
            console.log('Left was pressed');
            break;
    }
    if (nextDir === -1)
        return
    if (online || player1) {
        if (nextDir !== frameDirectionQueue[frameDirectionQueue.length - 1]) {
            frameDirectionQueue.push(nextDir)
            console.log("frameDirectionQueue: ", frameDirectionQueue)
        }
    } else if (nextDir !== frameDirectionQueuePlayer2[frameDirectionQueuePlayer2.length - 1]) {
        frameDirectionQueuePlayer2.push(nextDir)
        console.log("frameDirectionQueuePlayer2: ", frameDirectionQueuePlayer2)
    }
})