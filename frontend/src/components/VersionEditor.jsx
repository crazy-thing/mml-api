import React, { useState, useEffect } from 'react';
import '../styles/VersionEditor.scss';
import { editModpack } from '../util/api';
import FileUpload from './FileUpload';
import TextEdit from './TextEdit';
import Button from './Button';

const VersionEditor = ({ modpack, toggleVersionEditor, setSelectedModpack, selectedVersion, setSelectedVersion }) => {
    const [versions, setVersions] = useState([]);
    const [newVersion, setNewVersion] = useState({
        id: Date.now(),
        name: '',
        size: '',
        changelog: '',
        zip: '',
    });
    const [progress, setProgress] = useState(0);
    const [uploadProg, setUploadProg] = useState(0); 
    const [showUploadProgress, setShowUploadProgress] = useState(false); 

    const [isEdit, setIsEdit] = useState(false);
    const [editIndex, setEditIndex] = useState(null);

    useEffect(() => {
        if (modpack && modpack.versions != null) {
            setVersions(modpack.versions);
        }

        if (selectedVersion != null) {
            setNewVersion(selectedVersion);
            setIsEdit(true);
            setEditIndex(modpack.versions.findIndex(version => version.id === selectedVersion.id));
        }
    }, [modpack, selectedVersion]);

    const handleAddVersion = async () => {
        try {
            if (!newVersion.name || !newVersion.zip || !newVersion.changelog) {
                console.log(newVersion);
                alert('Please fill in all fields for the new version.');
                return;
            }

            let updatedVersions;
            if (isEdit) {
                updatedVersions = versions.map((version, index) => 
                    index === editIndex ? newVersion : version
                );
            } else {
                updatedVersions = [...versions, newVersion];
            }

            const { updatedModpack } = await editModpack(
                modpack.id,
                { versions: updatedVersions },
                import.meta.env.VITE_IP,
                localStorage.getItem('api-key'),
                setProgress
            );

            setSelectedModpack(updatedModpack);
            setVersions(updatedModpack.versions);

            setNewVersion({ id: Date.now(), name: '', size: '', zip: '', changelog: '' });
            setSelectedVersion(null);
            setIsEdit(false);
            setEditIndex(null);

            toggleVersionEditor(null);
        } catch (error) {
            console.error('Failed to add version:', error);
        }
    };

    const handleInputChange = (name, value) => {
        console.log(`changing item with name: ${name} value: ${value}`);
        setNewVersion(prevState => ({ ...prevState, [name]: value }));
    };
    
    const handleFileChange = (file) => {
        handleInputChange("size", file.size);
        handleInputChange("zip", file.name);
    };

    const handleDeleteFile = () => {
        handleInputChange("size", "");
        handleInputChange("zip", "");
    };

    return (
        <div className='version-editor'>
            <div className='version-editor-content'>
                <div className='version-editor-content-top'>
                <div className='version-editor-content-left'>
                    <h2>{isEdit ? 'Edit Version' : 'Add New Version'}</h2>
                    <input className="version-editor-content-name" type="text" name="name" value={newVersion.name} placeholder="Version Name" onChange={(e) => handleInputChange(e.target.name, e.target.value)} />
                </div>
                    <FileUpload onChange={handleFileChange} version={newVersion} handleDeleteFile={handleDeleteFile}/>
                </div>

                <TextEdit handleFormChange={(value) => handleInputChange("changelog", value)} existingHtml={selectedVersion && selectedVersion.changelog} />

                <div className='version-editor-buttons'>
                    <Button onClick={handleAddVersion} text={"Save Version"} style={{background: "var(--button-primary)", width: "150px", height: "50px", borderRadius: "4px"}}/>
                    <Button onClick={() => toggleVersionEditor(null)} text={"Close "} style={{background: "var(--button-secondary)", width: "150px", height: "50px", borderRadius: "4px"}}/>
                </div>

            </div>
        </div>
    );
};

export default VersionEditor;
