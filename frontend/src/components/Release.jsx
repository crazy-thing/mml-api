import React from 'react';
import '../styles/Release.scss';

const Release = ({ version }) => {
  return (
    <div className='release'>
        <p className='release-version'> {version.name} </p>
        <div className='release-changelog' dangerouslySetInnerHTML={{__html: version.changelog }}/>
    </div>
  )
};

export default Release;