const Modpack = require('../models/modpack');
const path = require('path');
const fs = require('fs');


const deleteFiles = async (filesToDelete, uploadsPath) => {
    try {
        for (const file of filesToDelete) {
            const usageCount = await Modpack.countDocuments({ $or: [{ 'mainVersion.zip': file }, { thumbnail: file }, { screenshots: file}, {background: file}] });


            if (usageCount === 0) {
                const filePath = path.join(uploadsPath, file);

                if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`Deleted file: ${filePath}`)
                }
            }
            }
    } catch (error) {
        console.error('Error deleting files: ', error);
    }
}

module.exports = { deleteFiles }