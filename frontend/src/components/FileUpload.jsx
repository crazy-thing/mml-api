import React, { useRef, useState, useEffect } from 'react';
import { cloud } from '../assets/exports';
import '../styles/FileUpload.scss';
import UploadedFile from './UploadedFile';

const CHUNK_SIZE = 20 * 1024 * 1024; // 20MB per chunk

const FileUpload = ({ onChange, version, handleDeleteFile }) => {
    const [tempVersion, setTempVersion] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProg, setUploadProg] = useState(0);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (version.zip !== '' | version.zip) {
            setTempVersion(version);
            setUploadProg(100);
        }
    }, [version]);

    const handleVersion = async (newVersion) => {
        if (!newVersion.name.toLowerCase().endsWith('.zip')) {
            console.error('Invalid file type. Please upload a ZIP file.');
            return;
        }
        onChange(newVersion)
        setTempVersion({
            zip: newVersion.name,
            size: newVersion.size
        });

        const totalChunks = Math.ceil(newVersion.size / CHUNK_SIZE);
        let uploadedSize = 0;

        for (let i = 0; i < totalChunks; i++) {
            const start = i * CHUNK_SIZE;
            const end = Math.min(newVersion.size, start + CHUNK_SIZE);
            const chunk = newVersion.slice(start, end);

            const formData = new FormData();
            formData.append('chunk', chunk);
            formData.append('fileName', newVersion.name);
            formData.append('chunkIndex', i);
            formData.append('totalChunks', totalChunks);

            try {
                const response = await fetch(`${import.meta.env.VITE_IP}/upload`, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'x-api-key': localStorage.getItem('api-key')
                    }
                });

                if (!response.ok) {
                    throw new Error('Upload failed');
                }

                uploadedSize += chunk.size;
                const progress = (uploadedSize / newVersion.size) * 100;
                setUploadProg(progress);

            } catch (error) {
                console.error('Upload failed:', error);
                return;
            }
        }

        alert('Upload complete!');
    };

    const handleFileInputChange = (event) => {
        const files = event.target.files;
        handleVersion(files[0]);
    };

    const handleClick = () => {
        fileInputRef.current.click();
    };

    const handleDragEnter = (event) => {
        event.preventDefault();
        setIsDragging(true);
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setIsDragging(false);
        const files = event.dataTransfer.files;
        handleVersion(files[0]);
    };

    const removeVersion = () => {
        handleDeleteFile();
        setTempVersion(null);
    };

    return (
        <div
            className={`file-upload ${isDragging ? 'dragging' : ''}`}
            onClick={handleClick}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {tempVersion ? (
                <UploadedFile uploadedVersion={tempVersion} removeVersion={removeVersion} progress={uploadProg} />
            ) : (
                <>
                    <div className='file-upload-content'>
                        <img src={cloud} alt='Cloud upload icon' width={28} height={28} />
                        <p className='file-upload-content-text'>Drop files here or click to upload</p>
                    </div>
                    <input
                        type='file'
                        accept='.zip'
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileInputChange}
                    />
                </>
            )}
        </div>
    );
};

export default FileUpload;