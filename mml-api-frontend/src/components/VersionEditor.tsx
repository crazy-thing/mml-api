import React, { useEffect } from 'react'
import '../styles/VersionEditor.scss'
import { ModpackType, VersionType } from '../types/Modpack';
import { check, trash2 } from '../assets/exports';
import { editModpack } from '../util/api';
import TextEdit from './TextEdit';


interface VersionEditorProps {
    setShowVersionEditor: React.Dispatch<React.SetStateAction<boolean>>;
    ver?: VersionType;
    modpack: ModpackType
    modpackId?: string;
    setSelectedModpack?: React.Dispatch<React.SetStateAction<ModpackType>>;
    setSelectedVersion?: React.Dispatch<React.SetStateAction<VersionType | null>>;
}

const VersionEditor = ({setShowVersionEditor, ver, modpackId, setSelectedModpack, modpack, setSelectedVersion}: VersionEditorProps) => {
    const [version, setVersion] = React.useState<VersionType>(ver || {});
    const [, setVersionZipFile] = React.useState<File | null>(null);
    const [progress, setProgress] = React.useState<number>(0);

    // Function for uploading the zip file

    useEffect(() => {
        if (version.id) {
            setVersion(prev => ({ ...prev, id: version.id }));
        } else {
            setVersion(prev => ({ ...prev, id: Date.now().toString()}));
        }

        if (version.zip) {
            setProgress(100);
        }
    }, []);

    const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setVersionZipFile(file);
            handleFileChange(file);
        } else {
            console.error('No file selected');
        }
    };

    const toggleClean = () => {
        let clean;
        if (version.clean == "true") {
            clean = "false";
        }
        else {
            clean = "true";
        }
        setVersion({ ...version, clean: clean })    
    }

    const handleFileChange = async (file: File) => {
        setVersion(prev => ({ ...prev, zip: file.name }));
        setVersion(prev => ({ ...prev, size: file.size.toString()}));
    
        const CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
        let uploadedSize = 0;
    
        setProgress(1);
    
        for (let i = 0; i < totalChunks; i++) {
            const start = i * CHUNK_SIZE;
            const end = Math.min(file.size, start + CHUNK_SIZE);
            const chunk = file.slice(start, end);
    
            const formData = new FormData();
            formData.append('chunk', chunk);
            formData.append('fileName', file.name);
            formData.append('chunkIndex', i.toString());
            formData.append('totalChunks', totalChunks.toString());
    
            await new Promise<void>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', `${import.meta.env.VITE_IP}/upload`);
                xhr.setRequestHeader('x-api-key', localStorage.getItem('apiKey') as string);
    
                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        uploadedSize += chunk.size;
                        const percentComplete = Math.round((uploadedSize / file.size) * 100);
                        setProgress(percentComplete);
                        resolve();
                        console.log(`Chunk ${i + 1} of ${totalChunks} uploaded successfully`);
                    } else {
                        console.error('Chunk upload failed:', xhr.responseText);
                        reject(new Error('Chunk upload failed'));
                    }
                };
    
                xhr.onerror = () => {
                    console.error('Chunk upload error:', xhr.statusText);
                    reject(new Error('Chunk upload error'));
                };
    
                xhr.send(formData);
            });
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setVersion(prev => ({ ...prev, zip: '' }));
        setProgress(0);
        setVersionZipFile(null);
    };

    const handleSave = async () => {
        try {
            const updatedVersions = modpack.versions || [];
            console.log(version.id);
            for (let i = 0; i < updatedVersions.length; i++) {
                console.log(`${updatedVersions[i].id} == ${version.id}`);
            }
            const existingVersionIndex = updatedVersions.findIndex((v) => v.id === version.id);
            if (existingVersionIndex !== -1) {
                updatedVersions[existingVersionIndex] = version;
            } else {
                updatedVersions.push(version);
            }
            const res = await editModpack(
                modpackId ?? '',
                { versions: updatedVersions },
                `${import.meta.env.VITE_IP}/`,
                localStorage.getItem('apiKey') as string,
                setProgress
            ) as { updatedModpack: ModpackType };
    
            console.log("Updated modpack:", res.updatedModpack);
            setSelectedModpack?.(res.updatedModpack);
    
            setShowVersionEditor(false);
            setSelectedVersion?.(version);
        } catch (error) {
            console.error('Error saving version:', error);
        }
    };

    const handleChangelogChange = (updatedHtml: string) => {
        setVersion({ ...version, changelog: updatedHtml});
    }

    const handleClose = () => {
        setShowVersionEditor(false);
        setSelectedVersion?.(version);
    }
    

  return (
    <div className='version-editor'>
      <div className='version-editor__top'>
        <span className='version-editor__top-button' onClick={() => handleClose()}>GO BACK</span>
        <span className='version-editor__top-button save' onClick={progress == 100 || progress == 0 ? () => handleSave() : () => console.log("Please wait for upload to finish")}>SAVE</span>  
      </div>

      <div className='version-editor__bottom'>
        <div className='version-editor__bottom-table__wrapper'>
            <table className='version-editor__bottom-table'>
                <thead>
                    <tr className='version-editor__bottom-table-row'>
                        <th>Version #</th>
                        <th>Date</th>
                        <th>Zip File</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className='version-editor__bottom-table-row'>
                        <td>
                            <input
                                className='version-editor__bottom-table-button'
                                value={version?.name}
                                placeholder='Add Version #'
                                onChange={(e) => setVersion({ ...version, name: e.target.value })}
                            />
                        </td>
                        <td>
                            <input
                                className='version-editor__bottom-table-button'
                                value={version?.date}
                                placeholder='Add Date'
                                onChange={(e) => setVersion({ ...version, date: e.target.value })}
                            />
                        </td>
                        <td>
                            {version?.zip && progress == 100 ? 
                                <span className='version-editor__bottom-table-button zip'>{version?.zip} <img src={trash2} className='version-editor__bottom-table-button-delete' onClick={(e) => handleDelete(e)} /></span> 
                                : 
                                <span 
                                    className='version-editor__bottom-table-button file' 
                                    onClick={() => document.getElementById("file-input")?.click()}
                                    style={{background: progress != 0 && progress != 100 ? `linear-gradient(90deg, #3aa3d0 ${progress}%, transparent ${progress}%)` : ''}}
                                    >
                                        {progress != 0 && progress != 100 ? `${progress}%` : 'Click to Upload'}
                                </span>
                            }
                        </td>
                    </tr>
                </tbody>
            </table>

             <div className='version-editor__changelog-wrapper'>
                <TextEdit existingHtml={version?.changelog ?? null} handleFormChange={handleChangelogChange} />
             </div>
        </div>
            <div className='version-editor__bottom__clean'>
                <span className='version-editor__bottom__clean-checkbox' onClick={() => toggleClean()}> {version && version.clean == "true" ? <img src={check} className='version-editor__bottom__clean-checkbox-icon' /> : ""}</span>
                <p className='version-editor__bottom__clean-text' >CLEAN INSTALL</p>
            </div>
      </div>

      <input type="file" id="file-input" accept='.zip' style={{ display: 'none' }} onChange={(e) => handleFileInputChange(e)} />

    </div>
  )
}

export default VersionEditor