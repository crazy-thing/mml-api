import React, { useEffect, useState } from 'react';
import '../styles/VersionsList.scss';
import Button from './Button';
import { deleteIcon, starOutline, starSolid } from '../assets/exports';
import { editModpack } from '../util/api';
import VersionEditor from './VersionEditor';

const VersionsList = ({ modpack, toggleVersions, setSelectedModpack }) => {

    const [progress, setProgress] = useState(0);
    const [showVersionEditor, setShowVersionEditor] = useState(false);
    const [selectedVersion, setSelectedVersion] = useState(null);

    const handleSave = async (updatedFields = {}) => {
        try {
            const {response, updatedModpack } = await editModpack(modpack.id, updatedFields, `${import.meta.env.VITE_IP}/`, localStorage.getItem('api-key'), setProgress);
            setSelectedModpack(updatedModpack);
            console.log('Modpack updated successfully:', updatedModpack);
        } catch (error) {
            console.error('Failed to update modpack:', error);
        }
    };

    const handleMainVersion = async (e, ver) => {
        e.stopPropagation();
        await handleSave({mainVersion: ver});
    };

    const selectVersion = (ver) => {
        setSelectedVersion(ver);
        toggleVersionEditor(true);
    };

    const toggleVersionEditor = (edit = null) => {
        if (edit === null) {
            setSelectedVersion(null);
        }
        setShowVersionEditor(!showVersionEditor);
    };

    const sortedVersions = [...modpack.versions].sort((a, b) => {
        if (a.id === modpack.mainVersion.id) return -1;
        if (b.id === modpack.mainVersion.id) return 1;
    
        const versionA = a.name.split('.').map(Number);
        const versionB = b.name.split('.').map(Number);
    
        for (let i = 0; i < Math.max(versionA.length, versionB.length); i++) {
            if ((versionA[i] || 0) > (versionB[i] || 0)) return -1;
            if ((versionA[i] || 0) < (versionB[i] || 0)) return 1;
        }
        return 0;
    });

    const handleDelete = (e, verId) => {
        e.stopPropagation();
        const confirmDelete = window.confirm('Are you sure you want to delete this version?');
        if (confirmDelete) {
            const index = modpack.versions.findIndex(version => version.id === verId);
            if (index !== -1) {
                const updatedVersions = modpack.versions.filter(version => version.id !== verId);
                handleSave({ versions: updatedVersions });
            }
        }
    };


  return (
    <div className='versions-list-container'>
        {showVersionEditor &&
            <VersionEditor modpack={modpack} toggleVersionEditor={toggleVersionEditor} setSelectedModpack={setSelectedModpack} selectedVersion={selectedVersion ? selectedVersion : null} setSelectedVersion={setSelectedVersion}/>
        }
    <div className='versions-list'>
        <div className='versions-list-buttons'>
            <Button onClick={() => toggleVersionEditor(null)} text={"Add Version"} style={{width: "fit-content", height: "50px"}} />
            <Button onClick={toggleVersions} text={"Close"} style={{width: "fit-content", height: "50px"}} />
        </div>

        <table className='versions-list-table'>
            <thead className='versions-list-table-header-row'>
                <tr>
                    <th>Version</th>
                    <th>Release Status</th>
                    <th>Zip File</th>
                </tr>
            </thead>

            <tbody>
                {sortedVersions.map((version, index) => (
                    <tr key={index} className='versions-list-table-row' onClick={() => selectVersion(version)}>
                        <td>{version.name}</td>
                        <td>{version.zip}</td>
                        <td onClick={(e) => handleMainVersion(e, version)}>
                            {modpack.mainVersion && version.id === modpack.mainVersion.id ? (
                                    <img
                                        className='versions-list-main-indicator'
                                        src={starSolid}
                                        alt='Main Version'
                                    />
                                ) : (
                                    <img
                                        className='versions-list-main-indicator'
                                        src={starOutline}
                                        alt='Main Version'
                                    />
                                )}
                        </td>
                        <td>
                            <img
                                className='versions-list-table-row-del'
                                src={deleteIcon}
                                alt='Delete'
                                onClick={(e) => handleDelete(e, version.id)}
                            />
                        </td>

                    </tr>
                ))}
            </tbody>
        </table>
    </div>
    </div>
  )
};

export default VersionsList;