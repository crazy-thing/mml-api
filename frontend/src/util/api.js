const createFormData = (modpack) => {
    const formData = new FormData();

    formData.append('name', modpack.name);
    formData.append('index', modpack.index);
    formData.append('version', modpack.version);
    formData.append('description', modpack.description);
    formData.append('thumbnail', modpack.thumbnail); 
    formData.append(`background`, modpack.background);
        
    if (modpack.mainVersion != null) {
        formData.append('mainVersion[name]', modpack.mainVersion.name);
        formData.append('mainVersion[id]', modpack.mainVersion.id);
        formData.append('mainVersion[zip]', modpack.mainVersion.zip);
        // formData.append('mainVersion[zipFile]', modpack.mainVersion.zipFile);
        formData.append('mainVersion[size]', modpack.mainVersion.size);
        formData.append('mainVersion[changelog]', modpack.mainVersion.changelog);
    }
    

    if (modpack.screenshotsFiles != null) {
        modpack.screenshotsFiles.forEach((file, index) => {
            formData.append(`screenshotsFiles[${index}]`, file);
        });
    }

    if (modpack.deletedScreenshots != null) {
        modpack.deletedScreenshots.forEach((screenshot, index) => {
            formData.append(`deletedScreenshots[${index}]`, screenshot);
        });
    }

    if (modpack.versions.length === 0) {
        formData.append('versions', 'empty'); 
    } else {
        modpack.versions.forEach((version, index) => {
            formData.append(`versions[${index}][name]`, version.name);
            formData.append(`versions[${index}][id]`, version.id);
            formData.append(`versions[${index}][zip]`, version.zip); 
            // formData.append(`versions[${index}][zipFile]`, version.zipFile);
            formData.append(`versions[${index}][size]`, version.size);
            formData.append(`versions[${index}][changelog]`, version.changelog);

        });
    }

    return formData;
};


export const createTemplateModpack = async (apiUrl, apiToken) => {
    const response = await fetch(`${apiUrl}/template`, {
      method: 'POST',
      headers: {
        'x-api-key': apiToken,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to create modpack template');
    }
    const data = await response.json();
    return data.modpack; 
  };

export const uploadModpack = async (modpack, baseUrl, newApiKey, setProgress) => {
    try {
        const formData = createFormData(modpack);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', baseUrl);

        xhr.setRequestHeader('x-api-key', newApiKey);

        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
                const percentComplete = (event.loaded / event.total) * 100;
                console.log(`Upload progress: ${percentComplete.toFixed(2)}%`);
                setProgress(percentComplete.toFixed(2));
            }
        });

        xhr.send(formData);

        return new Promise((resolve, reject) => {
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    reject(new Error('Failed to upload file'));
                }
            };
            xhr.onerror = () => {
                reject(new Error('Error uploading file'));
            };
        });
    } catch (error) {
        console.error('Error uploading file: ', error);
        throw error;
    }
};

export const editModpack = async (modpackId, updatedFields, baseUrl, newApiKey, setProgress) => {
    try {
        const formData = new FormData();

        for (const key in updatedFields) {
            if (updatedFields.hasOwnProperty(key)) {
                if (key === 'screenshotsFiles') {
                    updatedFields[key].forEach((file, index) => {
                        formData.append(`screenshotsFiles[${index}]`, file);
                    });
                } else if (key === 'deletedScreenshots') {
                    // Append each deleted screenshot name as a parameter
                    updatedFields[key].forEach((screenshotName, index) => {
                        formData.append(`deletedScreenshots[${index}]`, screenshotName);
                    });
                } else if (key === "mainVersion") {
                    formData.append('mainVersion[name]', updatedFields.mainVersion.name);
                    formData.append('mainVersion[id]', updatedFields.mainVersion.id);
                    formData.append('mainVersion[zip]', updatedFields.mainVersion.zip);
                    formData.append('mainVersion[size]', updatedFields.mainVersion.size);
                    formData.append('mainVersion[changelog]', updatedFields.mainVersion.changelog);
                } else if (key === 'versions') {
                    if (updatedFields.versions.length === 0) {
                        formData.append('versions', 'empty'); 
                    } else {
                        updatedFields.versions.forEach((version, index) => {
                            formData.append(`versions[${index}][name]`, version.name);
                            formData.append(`versions[${index}][id]`, version.id);
                            formData.append(`versions[${index}][zip]`, version.zip); 
                            formData.append(`versions[${index}][size]`, version.size);
                            formData.append(`versions[${index}][changelog]`, version.changelog);
                
                        });
                    }                } else {
                    formData.append(key, updatedFields[key]);
                }
            }
        }

        console.log('FormData entries:', Array.from(formData.entries()));

        const xhr = new XMLHttpRequest();
        xhr.open('PUT', `${baseUrl}/${modpackId}`);

        xhr.setRequestHeader('x-api-key', newApiKey);

        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
                const percentComplete = (event.loaded / event.total) * 100;
                console.log(`Upload progress: ${percentComplete.toFixed(2)}%`);
                setProgress(percentComplete.toFixed(2));
            }
        });

        xhr.send(formData);

        return new Promise((resolve, reject) => {
            xhr.onload = () => {
                console.log('XHR response:', xhr.responseText);
                if (xhr.status >= 200 && xhr.status < 300) {
                    const response = JSON.parse(xhr.responseText);
                    // Assuming the updated modpack data is included in the response
                    const updatedModpack = response.modpack; // Adjust this according to your API response structure
                    resolve({ response, updatedModpack });
                } else {
                    reject(new Error(`Failed updating modpack: ${xhr.statusText}`));
                }
            };
            xhr.onerror = () => {
                reject(new Error('Error updating modpack'));
            };
        });
    } catch (error) {
        console.error('Error updating modpack: ', error);
        throw error;
    }
};



export const getAllModpacks = async (baseUrl) => {
    try {
        const res = await fetch(baseUrl, {
            method: 'GET',
        });

        if (!res.ok) {
            throw new Error('Failed to fetch modpacks');
        }

        return res.json();
    } catch (error) {
        console.error('Error fetching modpacks: ', error);
        throw error;
    }
};

export const deleteModpack = async (modpack, baseUrl, newApiKey) => {
    try {
        const res = await fetch(`${baseUrl}/${modpack.id}`, {
            method: 'DELETE',
            headers: {
                "x-api-key": newApiKey,
            }
        });

        if (!res.ok) {
            throw new Error(`Failed to delete modpack with ID: ${modpack.id}`);
        }

        return res.json();
    } catch (error) {
        console.error('Error deleting modpack: ', error);
        throw error;
    }
};


export const uploadVersion = async (modpackId, baseUrl, newApiKey, version) => {
    try {
        const formData = new FormData();

        formData.append('name', version.name);
        formData.append('zip', version.zip);
        formData.append('changelog', version.changelog);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${baseUrl}/${modpackId}/versions`);
        xhr.setRequestHeader('x-api-key', newApiKey);

        xhr.send(formData);

        return new Promise((resolve, reject) => {
            xhr.onload = () => {
                console.log('XHR response:', xhr.responseText);
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    reject(new Error(`Failed uploading version: ${xhr.statusText}`));
                }
            };
            xhr.onerror = () => {
                reject(new Error('Error uploading version'));
            };
        });
    } catch (error) {
        console.error('Error uploading version: ', error);
        throw error;
    }
};

export const deleteVersion = async (modpackId, versionId, baseUrl, newApiKey) => {
    try {
        const res = await fetch(`${baseUrl}/${modpackId}/versions/${versionId}`, {
            method: 'DELETE',
            headers: {
                "x-api-key": newApiKey,
            }
        });

        if (!res.ok) {
            throw new Error(`Failed to delete version with ID: ${versionId}`);
        }

        return res.json();
    } catch (error) {
        console.error('Error deleting version: ', error);
        throw error;
    }
};
