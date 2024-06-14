import React, { useEffect, useState } from 'react';
import '../styles/ModpackEditor.scss';
import Button from './Button';
import { editModpack } from '../util/api';
import Screenshots from './Screenshots';
import TextEdit from './TextEdit';
import Changelog from './Changelog';

const ModpackEditor = ({ toggleShowCreateModpack, modpack, setSelectedModpack }) => {
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingIndex, setIsEditingIndex] = useState(false);
    const [showDescription, setShowDescription] = useState(false);
    const [name, setName] = useState(modpack ? modpack.name : '');
    const [index, setIndex] = useState(modpack ? modpack.index : '');
    const [desc, setDesc] = useState(modpack ? modpack.desc : '');
    const [background, setBackground] = useState(null);
    const [thumbnail, setThumbnail] = useState(null);
    const [screenshots, setScreenshots] = useState([]);
    const [progress, setProgress] = useState(0);
    const [selectedItem, setSelectedItem] = useState("description");

    useEffect(() => {
        if (modpack) {
            setName(modpack.name);
            setIndex(modpack.index);
            setDesc(modpack.description);
        }
    }, [modpack]);

    useEffect(() => {
        document.querySelectorAll('.image-component img[data-keep-ratio]').forEach(img => {
            img.style.setProperty('width', img.style.maxWidth, 'important');
            img.style.setProperty('height', 'auto', 'important');
            img.style.setProperty('object-fit', 'contain', 'important');
        });
    }, [selectedItem]);

    const handleNameClick = () => {
        setIsEditingName(true);
        setIsEditingIndex(false); 
    };

    const handleIndexClick = () => {
        setIsEditingIndex(true);
        setIsEditingName(false); 
    };

    const handleNameChange = (event) => {
        setName(event.target.value);
    };

    const handleIndexChange = (event) => {
        setIndex(event.target.value);
    };

    const handleDescChange = (newDesc) => {
        setDesc(newDesc);
    };

    const closeAndSaveDesc = async () => {
        setShowDescription(false);
        await handleSave({ description: desc });
    };

    const handleBackgroundChange = async (event) => {
        const file = event.target.files[0];
        setBackground(file);
        await handleSave({ background: file });
    };

    const handleThumbnailChange = async (event) => {
        const file = event.target.files[0];
        setThumbnail(file);
        await handleSave({ thumbnail: file });
    };

    const handleScreenshotChange = async (event) => {
        const file = event.target.files[0];
        setScreenshots([file]);
        await handleSave({ screenshotsFiles: [file] });
    };

    const handleDeleteScreenshot = async (screenshot) => {
        const newPack = await handleSave({ deletedScreenshots: [screenshot] });
        setSelectedModpack(newPack);
    };

    const handleSave = async (updatedFields = {}) => {
        setIsEditingName(false);
        setIsEditingIndex(false);
        try {
            if (name && !updatedFields.name) updatedFields.name = name;
            if (index && !updatedFields.index) updatedFields.index = index;
            const { response, updatedModpack } = await editModpack(modpack.id, updatedFields, `${import.meta.env.VITE_IP}/`, localStorage.getItem('api-key'), setProgress);
            setSelectedModpack(updatedModpack);
            console.log('Modpack updated successfully:', updatedModpack);
        } catch (error) {
            console.error('Failed to update modpack:', error);
        }
    };

    const renderInfo = () => {
        switch (selectedItem) {
            case "description":
                return (
                    <div className='parsed-content' dangerouslySetInnerHTML={{ __html: modpack.description }} />
                );
            case "screenshots":
                return (
                    <div>
                        <Screenshots screenshots={modpack.screenshots} onDelete={handleDeleteScreenshot} />
                    </div>
                );
            case "changelog":
                return (
                    <div>
                        <Changelog versions={modpack && modpack.versions} />
                    </div>
                );
            default:
                return null;
        }
    };

    const buttonStyle = {
        height: "100%",
        cursor: "pointer"
    };

    return (
        <div className='modpack-editor-container'>
            {showDescription && (
                <div className='modpack-editor-description-editor'>
                    <Button onClick={() => closeAndSaveDesc()} text={"Close"} />
                    <TextEdit handleFormChange={handleDescChange} existingHtml={modpack && modpack.description} />
                </div>
            )}
            <div className='modpack-editor-toolbar'>
                <div className='modpack-editor-toolbar-main'>
                    <Button onClick={handleNameClick} text={"Name"} style={buttonStyle}/>
                    <Button onClick={handleIndexClick} text={"Index"} style={buttonStyle}/>
                    <Button onClick={() => document.getElementById('thumbnailInput').click()} text={"Thumbnail"} style={buttonStyle}/>
                    <Button onClick={() => document.getElementById('backgroundInput').click()} text={"Background"} style={buttonStyle}/>
                    <Button onClick={() => setShowDescription(true)} text={"Description"} style={buttonStyle}/>
                    <Button onClick={() => document.getElementById('screenshotInput').click()} text={"Screenshots"} style={buttonStyle}/>
                </div>
                <Button onClick={toggleShowCreateModpack} text={"Close"} style={{marginRight: "15px", fontWeight: "bold", fontSize: "18px"}} />
            </div>
            <div className='modpack-editor'
                style={{ backgroundImage: `url(${modpack && modpack.background ? `${import.meta.env.VITE_UPLOADS}${modpack.background}` : ''})` }}
            >
                <div className='modpack-editor-content'>
                    <div className='modpack-editor-top'>
                        <div className='modpack-editor-top-thumbnail-container'>
                            <img className='modpack-editor-top-thumbnail' src={`${import.meta.env.VITE_UPLOADS}${modpack && modpack.thumbnail}`} alt="Modpack thumbnail" />
                        </div>
                        <div className='modpack-editor-top-right'>
                            {isEditingName ? (
                                <input
                                    className='modpack-editor-inputs'
                                    type="text"
                                    value={name}
                                    onChange={handleNameChange}
                                    onBlur={() => handleSave({ name })}
                                    autoFocus
                                />
                            ) : (
                                <p className='modpack-editor-top-right-name'> {name} </p>
                            )}
                            {isEditingIndex ? (
                                <input
                                    className='modpack-editor-inputs index'
                                    type="text"
                                    value={index}
                                    onChange={handleIndexChange}
                                    onBlur={() => handleSave({ index })}
                                    autoFocus
                                />
                            ) : (
                                <p className='modpack-editor-top-right-name index'> Index: {index} </p>
                            )}
                        </div>
                    </div>
                    <div className='modpack-editor-description-header'>
                        <span className={`modpack-editor-description-header-text-container`} onClick={() => setSelectedItem("description")}>
                            <p className={`modpack-editor-description-header-text ${selectedItem === "description" && "selected"}`}>
                                DESCRIPTION
                            </p>
                        </span>
                        <span className={`modpack-editor-description-header-text-container`} onClick={() => setSelectedItem("screenshots")}>
                            <p className={`modpack-editor-description-header-text ${selectedItem === "screenshots" && "selected"}`}>
                                SCREENSHOTS
                            </p>
                        </span>
                        <span className={`modpack-editor-description-header-text-container`} onClick={() => setSelectedItem("changelog")}>
                            <p className={`modpack-editor-description-header-text ${selectedItem === "changelog" && "selected"}`}>
                                CHANGELOG
                            </p>
                        </span>
                    </div>
                    {renderInfo()}
                </div>
            </div>
            <input id="thumbnailInput" type="file" onChange={handleThumbnailChange} style={{ display: 'none' }} />
            <input id="backgroundInput" type="file" onChange={handleBackgroundChange} style={{ display: 'none' }} />
            <input id="screenshotInput" type="file" onChange={handleScreenshotChange} style={{ display: 'none' }} />
        </div>
    );
};

export default ModpackEditor;
