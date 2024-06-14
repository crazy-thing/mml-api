import React from 'react';
import { deleteIcon } from '../assets/exports';
import '../styles/Modpack.scss';
import Button from './Button';
import { deleteModpack } from '../util/api';

const Modpack = ({ modpack, toggleShowCreateModpack, toggleShowVersions, fetchModpacks}) => {
    const expressServerAdd = import.meta.env.VITE_UPLOADS;

    const handleDelete = async (e) => {
        e.stopPropagation();
        const confirmDelete = window.confirm('Are you sure you want to delete this modpack?');
        if (confirmDelete) {
            await deleteModpack(modpack, `${import.meta.env.VITE_IP}`, localStorage.getItem('api-key'));
            console.log("deleted modpack");
            fetchModpacks();
        }
    };

    return (
        <div className='modpack'>
            <div className='modpack-thumbnail'>
                <img src={expressServerAdd + modpack.thumbnail} alt='Modpack Thumbnail' width={350} height={200} />
            </div>
            <div className='modpack-content'>
                <div className='modpack-content-name-version'>
                    <p className='modpack-content-name'>{modpack.name}</p>
                    <p className='modpack-content-version'>{modpack.version}</p>
                </div>
                <div className='modpack-content-buttons'>
                    <Button 
                        text={"Edit"}
                        onClick={() => toggleShowCreateModpack(modpack)}
                        style={{width: "100px", height: "35px", borderRadius: "4px", background: "var(--button-primary)"}}/>
                    <Button 
                        text={"Versions"}
                        onClick={() => toggleShowVersions(modpack)}
                        style={{width: "100px", height: "35px", borderRadius: "4px", background: "var(--button-primary)"}}/>
                    <img className='modpack-content-buttons-delete' src={deleteIcon} alt='Delete Button' width={20} height={20} onClick={(e) => handleDelete(e)} />
                </div>
            </div>
        </div>
    );
};

export default Modpack;