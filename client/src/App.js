//dependencies
import React, { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";

//styles
import './App.css';

//components
import Header from "./components/Header";
import Footer from "./components/Footer";

//pages
import Login from "./pages/Login";
import Home from "./pages/Home";
import Game from "./pages/Game";

function App() {

  // const [data, setData] = React.useState(null);

  // React.useEffect(() => {
  //   fetch("/game")
  //     .then((res) => res.json())
  //     .then((data) => setData(data.message));
  // }, []);

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
      <Header onChange={handleResize}/>
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

    console.log(setDimensions)
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
