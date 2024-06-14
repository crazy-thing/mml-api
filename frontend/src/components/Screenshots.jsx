import React from 'react';
import '../styles/Screenshots.scss';

const Screenshots = ({ screenshots, onDelete }) => {
    const renderScreenshots = () => {
        const rows = [];
        for (let i = 0; i < screenshots.length; i+= 3 ) {
            const rowScreenshots = screenshots.slice(i, i + 3);
            rows.push(
                <div className='screenshots-row' key={`row-${i}`}>
                    {rowScreenshots.map((screenshot, index) => (
                        <img
                            onClick={() => onDelete(screenshot)}
                            key={`screenshot-${i}-${index}`}
                            className='screenshots-screenshot'
                            src={`${import.meta.env.VITE_UPLOADS}${screenshot}`}
                            alt={`Screenshot ${i + index}`}
                        />
                    ))}
                </div>
            )
        }
        return rows;
    }

  return (
    <div className='screenshots'>
        {renderScreenshots()}
    </div>
  )
};

export default Screenshots;