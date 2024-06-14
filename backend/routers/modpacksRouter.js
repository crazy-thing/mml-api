const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const Modpack = require('../models/modpack');
const { deleteFiles } = require('../helpers/deleteFiles');
const { authenticateApiKey } = require('../middleware/authApiKey');
const logger = require('../middleware/logger');

const uploadsPath = path.join(process.cwd(), '/uploads');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fieldSize: 100 * 10024 * 10024 }
 });

router.use(logger);

router.get('/', async (req, res) => {
    try {
        const modpacks = await Modpack.find();
        res.json(modpacks);
    } catch (error) {
        console.error('Error fetching mod packs:', error);
        res.status(500).json({ error: 'Error fetching mod packs:', error });
    }
});

router.post('/template', authenticateApiKey, async (req, res) => {
    const id = Date.now();
    try {
        const newModpack = new Modpack({
            id,
        });
        await newModpack.save();
        res.status(201).json({ message: 'Modpack template created successfully', modpack: newModpack });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error. Please confirm that all upload fields are provided.' });
    }
});

router.post('/', authenticateApiKey, upload.any([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'versions', maxCount: 100 },
    { name: 'background', maxCount: 1 },
    { name: 'screenshotsFiles', maxCount: 100}

]), async (req, res) => {
    const id = Date.now();
    const { name, index, description, mainVersion, versions } = req.body;

    try {
        
        const thumbnail = req.files.find(file => file.fieldname === 'thumbnail').filename;
        const background = req.files.find(file => file.fieldname === 'background').filename;

        req.files.forEach(file => {
            console.log(`Uploaded File: ${file.filename}`);
        });


        
        const screenshots = req.files
            .filter(file => file.fieldname.includes('screenshotsFiles'))
            .map(file => file.filename);


        const formattedVersions = versions.map(version => ({
            name: version.name,
            id: version.id,
            zip: version.zip,
            size: version.size,
            changelog: version.changelog
        }));

        const newModpack = new Modpack({
            id,
            index,
            name,
            description,
            screenshots,
            mainVersion,
            versions: formattedVersions,
            thumbnail,
            background
        });

        await newModpack.save();

        res.status(201).json({ message: 'Modpack created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error. Please confirm that all upload fields are provided.' });
    }
});

router.put('/:id', authenticateApiKey, upload.any([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'versions', maxCount: 100 },
    { name: 'background', maxCount: 100 },
    { name: 'screenshotsFiles', maxCount: 100}
]), async (req, res) => {
    const id = req.params.id;

    try {
        const selectedModpack = await Modpack.findOne({ id: id });
        if (!selectedModpack) {
            return res.status(404).json({ message: 'Modpack not found' });
        }

        const updatedModpack = {};

        for (const [key, value] of Object.entries(req.body)) {
                updatedModpack[key] = value;
        }

        if (req.body.versions === 'empty') {
            updatedModpack.versions = [];
        }

        const versionsToDelete = [];
        if (updatedModpack.versions && selectedModpack.versions) {
            for (const selectedVersion of selectedModpack.versions) {
                const matchedVersion = updatedModpack.versions.find(version => version.zip === selectedVersion.zip);
                if (!matchedVersion) {
                    console.log(`Versions to delete ${selectedVersion.zip}`);
                    versionsToDelete.push(selectedVersion.zip);
                }
            }
        }

        if (req.files && req.files.length > 0) {
            const screenshots = req.files
                .filter(file => file.fieldname.includes('screenshotsFiles'))
                .map(file => file.filename);
            updatedModpack.screenshots = [...selectedModpack.screenshots, ...screenshots];
        }
        
        console.log(req.body.deletedScreenshots);


        if (req.body.deletedScreenshots && req.body.deletedScreenshots.length > 0) {
            req.body.deletedScreenshots.forEach((filename) => {
                versionsToDelete.push(filename);
            });

            updatedModpack.screenshots = selectedModpack.screenshots.filter(filename =>
                !req.body.deletedScreenshots.includes(filename)
            );
        }


        if (req.files && req.files.find(file => file.fieldname === 'thumbnail')) {
            updatedModpack.thumbnail = req.files.find(file => file.fieldname === 'thumbnail').filename;
            versionsToDelete.push(selectedModpack.thumbnail);
        }
        if (req.files && req.files.find(file => file.fieldname === 'background')) {
            updatedModpack.background = req.files.find(file => file.fieldname === 'background').filename;
            versionsToDelete.push(selectedModpack.background);
        }

        await Modpack.updateOne({ id: id }, { $set: updatedModpack });
        await deleteFiles(versionsToDelete, uploadsPath);

        const updatedPack = await Modpack.findOne({ id: id});


        res.status(200).json({ message: 'Modpack updated successfully', modpack: updatedPack });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating modpack' });
    }
});


router.get('/:modpackId/versions/:versionId', async (req, res) => {
    const modpackId = req.params.modpackId;
    const versionId = req.params.versionId;

    try {
        const selectedModpack = await Modpack.findOne({ id: modpackId });
        if (!selectedModpack) {
            return res.status(404).json({ message: 'Modpack not found' });
        }

        const selectedVersion = selectedModpack.versions.find(version => version.id === versionId);
        if (!selectedVersion) {
            return res.status(404).json({ message: 'Version not found' });
        }

        const versionFlePath = path.join(uploadsPath, selectedVersion.zip);

        console.log(versionFlePath);
        if (fs.existsSync(versionFlePath)) {

            res.setHeader('Content-Disposition', `attachment; filename=${selectedVersion.zip}`);
            res.setHeader('Content-Type', 'application/octet-stream');

            const fileStream = fs.createReadStream(versionFlePath);
            fileStream.pipe(res);
        } else {
            res.status(404).json({ message: 'File not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error downloading modpack version' });
    }
});

router.get('/:modpackId/', async (req, res) => {
    const modpackId = req.params.modpackId;

    try {
        const selectedModpack = await Modpack.findOne({ id: modpackId });
        if (!selectedModpack) {
            return res.status(404).json({ message: 'Modpack not found' });
        }

        const mainFilePath = path.join(uploadsPath, selectedModpack.mainVersion.zip);

        console.log(`Modpack Downloaded: ${mainFilePath}`);
        if (fs.existsSync(mainFilePath)) {
            res.setHeader('Content-Disposition', `attachment; filename=${mainFilePath}`);
            res.setHeader('Content-Type', 'application/octet-stream');

            const fileStream = fs.createReadStream(mainFilePath);
            fileStream.pipe(res);
        } else {
            res.status(404).json({ message: 'File not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error downloading modpack' });
    }
});


router.delete('/:id', authenticateApiKey, async (req, res) => {
    const id = req.params.id;

    try {
        const packToDelete = await Modpack.findOne({ id: id });

        if (!packToDelete) {
            return res.status(404).json({ message: 'Modpack not found' });
        }

        let filesToDelete = [];
        for (const version of packToDelete.versions) {
            if (version.zip) {
                filesToDelete.push(version.zip);
            }
        }

        for (const screenshot of packToDelete.screenshots) {
            if (screenshot != null) {
                filesToDelete.push(screenshot);
            }
        }

        if (packToDelete.thumbnail !== "") {
            filesToDelete.push(packToDelete.thumbnail);
        }


        await Modpack.deleteOne({ id: id });

        await deleteFiles(filesToDelete, uploadsPath);

        res.status(200).json({ message: 'Deleted modpack successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting modpack' });
    }
});

router.post('/:modpackId/versions', authenticateApiKey, async (req, res) => {
    const modpackId = req.params.modpackId;

    try {
        const selectedModpack = await Modpack.findOne({ id: modpackId });
        if (!selectedModpack) {
            return res.status(404).json({ message: 'Modpack not found' });
        }

        const { name, changelog, zip } = req.body;

        const newVersion = {
            id: Date.now(),
            name: name,
            changelog: changelog,
            zip: zip,
        };

        selectedModpack.versions.push(newVersion);

        await selectedModpack.save();

        res.status(201).json({ message: 'Version added successfully', version: newVersion });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding version' });
    }
});

router.delete('/:modpackId/versions/:versionId', authenticateApiKey, async ( req, res ) => {
    const modpackId = req.params.modpackId;
    const versionId = req.params.versionId;

    try {
        const selectedModpack = await Modpack.findOne({ id: modpackId });
        if (!selectedModpack) {
            return res.status(404).json({ message: 'Modpack not found' });
        }

        const selectedVersion = selectedModpack.versions.find(version => version.id === versionId);
        if (!selectedVersion) {
            return res.status(404).json({ message: 'Version not found' });
        }

        const versionIndex = selectedModpack.versions.findIndex(version => version.id === versionId);
        if (versionIndex === -1) {
            return res.status(404).json({ message: 'Version not found' });
        }
        
        selectedModpack.versions.splice(versionIndex, 1);

        const filesToDelete = [selectedVersion.zip];

        await deleteFiles(filesToDelete, uploadsPath);


        await selectedModpack.save();

        res.status(200).json({ message: 'Version deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting version' });
    }
});

router.post('/upload', upload.single('chunk'), authenticateApiKey, async (req, res) => {
    const { file } = req;
    const { fileName, chunkIndex, totalChunks } = req.body;
    const uploadDir = path.join(uploadsPath);
    const tempDir = path.join(uploadsPath, 'temp');

    try {
        await fs.ensureDir(uploadDir);
        await fs.ensureDir(tempDir);

        const chunkDir = path.join(tempDir, fileName);

        await fs.ensureDir(chunkDir);

        const chunkPath = path.join(chunkDir, `${chunkIndex}`);
        
        if (await fs.pathExists(chunkPath)) {
            await fs.remove(chunkPath);
        }

        await fs.move(file.path, chunkPath);

        if (parseInt(chunkIndex) + 1 === parseInt(totalChunks)) {
            const filePath = path.join(uploadDir, fileName);
            const writeStream = fs.createWriteStream(filePath);

            for (let i = 0; i < totalChunks; i++) {
                const chunkPath = path.join(chunkDir, `${i}`);
                const data = await fs.readFile(chunkPath);
                writeStream.write(data);
            }

            writeStream.end();
            await fs.remove(chunkDir);
        }

        res.sendStatus(200);
    } catch (error) {
        console.error('Error during file upload:', error);
        res.status(500).json({ message: 'Error during file upload', error: error.message });
    }
});

  
  

module.exports = router;