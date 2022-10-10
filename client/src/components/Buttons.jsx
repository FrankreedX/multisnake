import React from 'react';
import './buttons.css';

const Button = ({
    children,
    onClick,
    buttonStyle,
    buttonSize,
}) => {
    return(
        <button className={`button ${buttonStyle} ${buttonSize}`} onClick={onClick} type="button">
            {children}
        </button>
    )
};

export default Button;