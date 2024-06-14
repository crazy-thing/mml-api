const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const path = require('path');
const modPackRouter = require('./routers/modpacksRouter');
const authRouter = require('./routers/authRouter');

const { checkConfigFile, readConfigFile } = require('./helpers/configSetup');

checkConfigFile(() => {
    readConfigFile(async (err, config) => {
        if (err) {
            console.error('Error reading config file: ', err);
            return;
        }

        const app = express();
        const PORT = parseInt(config.port);

        app.use(bodyParser.json({ limit: '10000mb'}));
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
                    connectSrc: ["'self'", "http://localhost", "https://localhost", ],
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
                res.sendFile('build', 'index.html');
            });
    
            app.listen(PORT, () => {
                console.log(`Server is running on port ${PORT}`);
            });
        });

    });
});

const connectToDatabase = async (config, callback) => {
    try {
        console.log("Attempting to connect to MongoDB. This may take a minute...")
        await mongoose.connect(config.dbAddr); 
        console.log('Connected to MongoDB');
        callback();
    } catch (error) {
        console.log("Failed to connect to MongoDB. Please confirm the address is correct or install MongoDB locally.");
        connectToDatabase(config, callback);
    }
}

