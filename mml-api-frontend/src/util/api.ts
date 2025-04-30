import { ModpackType } from "../types/Modpack";

export const getAllModpacks = async (baseUrl: string) => {
    try {
        const res = await fetch(baseUrl);

        if (!res.ok) {
            throw new Error(`Failed to fetch all modpacks: ${res.status}`);
        }

        const data = await res.json();
        return data as ModpackType[];
    } catch (error) {
        console.error("Error fetching all modpacks:", error);
        throw error;
    }
}

export const createTemplateModpack = async (apiUrl: string, apiToken: string) => {
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

  export const deleteModpack = async (modpackId: string, baseUrl: string, newApiKey: string) => {
    try {
        const res = await fetch(`${baseUrl}/${modpackId}`, {
            method: 'DELETE',
            headers: {
                "x-api-key": newApiKey,
            }
        });

        if (!res.ok) {
            throw new Error(`Failed to delete modpack with ID: ${modpackId}`);
        }

        return res.json();
    } catch (error) {
        console.error('Error deleting modpack: ', error);
        throw error;
    }
};


export const editModpack = async (modpackId: string, updatedFields: any, baseUrl: string, newApiKey: string, setProgress: any) => {
    try {
        const formData = new FormData();

        for (const key in updatedFields) {
            if (!updatedFields.hasOwnProperty(key)) continue;

            if (key === 'mainVersion') {
                const main = updatedFields.mainVersion;
                if (!main) {
                    formData.append('mainVersion[name]', '');
                    formData.append('mainVersion[id]', '');
                    formData.append('mainVersion[zip]', '');
                    formData.append('mainVersion[size]', '');
                    formData.append('mainVersion[changelog]', '');
                    formData.append('mainVersion[date]', '');
                    formData.append('mainVersion[status]', '');
                    formData.append('mainVersion[visible]', '');
                    formData.append('mainVersion[jvmArgs]', '');
                } else {
                    formData.append('mainVersion[name]', main.name);
                    formData.append('mainVersion[id]', main.id);
                    formData.append('mainVersion[zip]', main.zip);
                    formData.append('mainVersion[size]', main.size);
                    formData.append('mainVersion[changelog]', main.changelog);
                    formData.append('mainVersion[date]', main.date);
                    formData.append('mainVersion[status]', main.status);
                    formData.append('mainVersion[visible]', main.visible);
                    formData.append('mainVersion[jvmArgs]', main.jvmArgs);
                }
            } else if (key === 'versions') {
                const versions = updatedFields.versions;
                if (!versions || versions.length === 0) {
                    formData.append('versions', 'empty');
                } else {
                    versions.forEach((v: any, i: any) => {
                        formData.append(`versions[${i}][name]`, v.name);
                        formData.append(`versions[${i}][id]`, v.id);
                        formData.append(`versions[${i}][zip]`, v.zip);
                        formData.append(`versions[${i}][size]`, v.size);
                        formData.append(`versions[${i}][changelog]`, v.changelog);
                        formData.append(`versions[${i}][date]`, v.date);
                        formData.append(`versions[${i}][visible]`, v.visible);
                        formData.append(`versions[${i}][clean]`, v.clean);
                    });
                }
            } else {
                formData.append(key, updatedFields[key]);
            }
        }

        const xhr = new XMLHttpRequest();
        xhr.open('PUT', `${baseUrl}/${modpackId}`);
        xhr.setRequestHeader('x-api-key', newApiKey);

        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
                const percent = (event.loaded / event.total) * 100;
                setProgress(percent.toFixed(2));
            }
        });

        xhr.send(formData);

        return new Promise((resolve, reject) => {
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    const response = JSON.parse(xhr.responseText);
                    resolve({ response, updatedModpack: response.modpack });
                } else {
                    reject(new Error(`Failed updating modpack: ${xhr.statusText}`));
                }
            };
            xhr.onerror = () => reject(new Error('Error updating modpack'));
        });

    } catch (error) {
        console.error('Error updating modpack:', error);
        throw error;
    }
};
