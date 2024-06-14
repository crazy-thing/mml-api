import React from 'react';
import '../styles/ToolbarButton.scss';

const ToolbarButton = ({ onClick, text, icon }) => {

  return (
    <div className='toolbar-button' onClick={onClick}>
        <img className='toolbar-button-icon' src={icon} alt='Toolbar Button Icon' />
        <p className='toolbar-button-text'> {text} </p>
    </div>
  )
};

export default ToolbarButton;