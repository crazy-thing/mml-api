import React from 'react';
import '../styles/Button.scss';

const Button = ({ text, onClick, style}) => {
    
  return (
    <div className='button' style={style} onClick={onClick}>
        <p className='button-text'> {text} </p>
    </div>
  )
};

export default Button;