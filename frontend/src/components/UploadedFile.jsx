import React from 'react';
import { fileIcon, deleteIcon } from '../assets/exports';
import '../styles/UploadedFile.scss';

const UploadedFile = ({ uploadedVersion, removeVersion, progress}) => {
  const versionSize = () => {
    try {
      let size = parseFloat(uploadedVersion.size);
      const suffixes = ['KB', 'MB', 'GB'];
      let i = -1;
      while (size >= 1000 && i < suffixes.length - 1) {
        size /= 1000;
        i++;
      }
      return `(${size.toFixed(2)} ${suffixes[i]})`;
    } catch (error) {
      console.error('Failed to calculate version zip file size: ', error);
    }
  };

  return (
    <div className='uploaded-file'>
      <img src={fileIcon} alt='File Icon' width={30} height={38} />
      <div className='uploaded-file-content'>
        <div className='uploaded-file-content-info'>
          <p className='uploaded-file-content-info-text'>{uploadedVersion && uploadedVersion.zip} {versionSize()}</p>
            <img className='uploaded-file-content-info-delete' src={deleteIcon} alt='Delete Icon' width={20} height={21} onClick={removeVersion} />
        </div>
            <progress value={progress} max='100' className='uploaded-file-progress'>
                {progress}%
            </progress>
      </div>
    </div>
  );
};

export default UploadedFile;