const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false,
    },
    id: {
        type: String,
        required: false,
    },
    zip: {
        type: String,
        required: false,
    },
    size: {
        type: String,
        required: false,
    },
    changelog: {
        type: String,
        required: false,
    },
});

const modpackSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    index: {
        type: String,
        required: false,
    },
    name: {
        type: String,
        required: false,
    },
    description: {
        type: String,
        required: false,
    },
    screenshots: {
        type: [String],
        required: false,
    },
    thumbnail: {
        type: String,
        required: false,
    },
    background: {
        type: String,
        required: false,
    },
    mainVersion: {
        type: versionSchema,
        required: false,
    },
    versions: [versionSchema],
});

const Modpack = mongoose.model('Modpack', modpackSchema);

module.exports = Modpack;