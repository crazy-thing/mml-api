import React from 'react';
import '../styles/Toolbar.scss';
import ToolbarButton from './ToolbarButton';
import { add } from '../assets/exports';
import SearchBar from './SearchBar';

const Toolbar = ({ toggleShowCreateModpack }) => {

  return (
    <div className='toolbar'>
        <ToolbarButton
            text={"Create New Modpack"}
            icon={add}
            onClick={() => toggleShowCreateModpack(null)}
        />

        <SearchBar onChange={(e) => console.log(`changed ${e}`)}/>
    </div>
  )
};

export default Toolbar;