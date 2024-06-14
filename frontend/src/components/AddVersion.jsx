import React, { useState } from 'react';
import '../styles/AddVersion.scss';
import InputBox from './InputBox';
import DropDown from './DropDown';
import FileUpload from './FileUpload';
import Button from './Button';
import TextEdit from './TextEdit';


const AddVersion = ({ versions, version, toggleShowVersions, handleFormChange}) => {
    const [newVersion, setNewVersion] = useState({
        id: Date.now(),
        name: '',
        size: '',
        zip: '',
        zipFile: '',
        changelog: '',
    });
    const [isEdit, setIsEdit] = useState(false);

    const handleAddVersion = () => {
        if (isEdit) {
            const index = versions.findIndex(version => version.id === newVersion.id);
            if (index !== -1) {
                const updatedVersions = [...versions];
                updatedVersions[index] = newVersion;

                handleFormChange({ name: "versions", value: updatedVersions});
                toggleShowVersions();
            }
        }
        versions.push(newVersion);
        toggleShowVersions();
    };;

    useState(() => {
        if (version != null) {
            setNewVersion(version);
            setIsEdit(true);
        }
    }, []);

    const handleVersion = (fieldName, value) => {
        setNewVersion((prevValues) => ({
          ...prevValues,
          [fieldName]: value,
        }));
        console.log(`name is ${fieldName}   and value is ${value}`);
      };

  return (
    <div className='add-version'>

        <div className='add-version-container'>

        <div className='add-versions-container-left'>
            <div className='add-version-item-container'>
                <p className='add-version-item-header'> Version </p>
                <InputBox
                    value={newVersion.name}
                    placeHolder={"Enter version"}
                    handleFormChange={(value) => handleVersion('name', value)}
                />
            </div>  

        </div>

        <div className='add-version-item-container'>
            <p className='add-version-item-header'> Zip File </p>
            <div className='add-version-item-container-file'>
                <FileUpload onChange={handleVersion} version={newVersion} />
            </div>
        </div>
        
        </div>

        <div className='add-version-changelog'>
            <TextEdit handleFormChange={(value) => handleVersion('changelog', value)} existingHtml={newVersion ? newVersion.changelog : null } />
        </div>


        
        <div className='add-version-buttons'>
            <Button 
                onClick={() => handleAddVersion()}
                text={"Add"}
                style={{width: "140px", height: "50px", borderRadius: "4px", background: "var(--button-primary)"}}
            />
            <Button 
                onClick={toggleShowVersions}
                text={"Cancel"}
                style={{width: "140px", height: "50px", borderRadius: "4px"}}
            />

        </div>
    </div>
  )
};

export default AddVersion;