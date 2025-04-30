const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const path = require('path');
const modPackRouter = require('./routers/modpacksRouter');
const authRouter = require('./routers/authRouter');
const { checkConfigFile } = require('./helpers/config');

const connectToDatabase = async (config, callback) => {
    try {
        console.log("Attempting to connect to MongoDB. This may take a minute...");
        await mongoose.connect(config.dbAddr);
        console.log('Connected to MongoDB');
        callback();
    } catch (error) {
        console.log(`Failed to connect to MongoDB. Please confirm the address is correct or install MongoDB locally. ${error}`);
        connectToDatabase(config, callback);
    }
};

checkConfigFile(async (err, config) => {
    const app = express();
    const PORT = parseInt(config.port);

    app.use(bodyParser.json({ limit: '10000mb' }));
    app.use(bodyParser.urlencoded({ limit: '10000mb', extended: true }));
    app.use(cors());
    app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        next();
    });
    app.set('trust proxy', "::1");
    app.disable('x-powered-by');
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                connectSrc: ["'self'", "http://localhost:10000", "https://localhost:10000", "http://localhost", "https://localhost"],
                imgSrc: ["*", "data:", "blob:"],
                upgradeInsecureRequests: null
            },
        },
    }));
    app.use(config.apiUrl, modPackRouter);
    app.use(config.apiUrl, authRouter);
    app.use('/uploads', (req, res, next) => {
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        next();
    }, express.static('uploads'));

    await connectToDatabase(config, () => {
        app.use(express.static('build'));

        app.get('*', (req, res) => {
            res.sendFile('index.html', { root: 'build' });
        });

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    });
});
