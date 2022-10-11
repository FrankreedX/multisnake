// dependencies
import React, { useEffect, useState } from "react";

// style
import './Score.css';

const Score = () => {
    const [score, setScore] = useState({
        goal: 7,
        user: 1,
        opponent: 3
    });

    const ScoreBox = ({scoreBoxClass, color}) =>{
        return <div className={`${scoreBoxClass}`} style={{backgroundColor: color}}></div>
    }

    const ScoreNumber = ({children}) => {
        return <div className="score-number"> {children} </div>
    }

    const PlayerScore = ({divID, score, goal}) => {

        const scoreBoxes = [];

        for(let i = 0; i < goal; i++){
            let scoreBoxClass = "score-Box";
            let color = null

            if(i + 1 <= score){
                if(divID === "user-score"){
                    color = "#2a4ae8";
                }else{
                    color = "#dd2626";
                }
            }
            if(i + 1 === goal){
                scoreBoxClass = "final-score-box";
            }

            scoreBoxes.push(<ScoreBox scoreBoxClass={scoreBoxClass} color={color} />);
        }
        scoreBoxes.push( <ScoreNumber children={score} />)
        if(divID === "opponent-score"){
            scoreBoxes.reverse();
        }

        return(
            <div id={divID}>
                {scoreBoxes}
            </div>
        );
    }
    
    return(
        <div id="score">
            <PlayerScore divID={"user-score"} score={score.user} goal={score.goal}/>
            <div id="score-status">
                VS
            </div>
            <PlayerScore divID={"opponent-score"} score={score.user} goal={score.goal}/>
        </div>
    );
}

export default Score;