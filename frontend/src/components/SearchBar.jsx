import React from 'react';
import '../styles/SearchBar.scss';

const SearchBar = ({ onChange }) => {
  return (
        <input className='searchbar' placeholder='Search' type='text' onChange={(e) => onChange(e.target.value)} />
  )
};

export default SearchBar;