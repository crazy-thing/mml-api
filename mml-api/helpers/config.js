const fs = require('fs');
const path = require('path');
const { checkApiToken } = require('./apiToken');

const configFilePath = path.join(process.cwd(), './config.json');

const defaultConfig = {
    port: '10000',
    apiUrl: '/example/v1',
    dbAddr: 'mongodb://localhost:27017/modpacks',
};

const checkConfigFile = (callback) => {
    try {
        checkApiToken(() => {
            if (fs.existsSync(configFilePath)) {
                fs.readFile(configFilePath, 'utf8', (err, data) => {
                    if (err) {
                        console.error('Error reading config file:', err);
                        return callback(err);
                    }

                    let config;
                    try {
                        config = JSON.parse(data);
                    } catch (jsonErr) {
                        console.error('Error parsing config file:', jsonErr);
                        return callback(jsonErr);
                    }

                    let configUpdated = false;
                    for (const key in defaultConfig) {
                        if (!(key in config)) {
                            config[key] = defaultConfig[key];
                            configUpdated = true;
                        }
                    }

                    if (configUpdated) {
                        fs.writeFile(configFilePath, JSON.stringify(config, null, 4), (err) => {
                            if (err) {
                                console.error('Error updating config file:', err);
                            } else {
                                console.log('Config file updated with missing default values.');
                            }
                        });
                    }

                    callback(null, config);
                });
            } else {
                fs.writeFile(configFilePath, JSON.stringify(defaultConfig, null, 4), (err) => {
                    if (err) {
                        console.error('Error writing config file:', err);
                    } else {
                        console.log('Config file created successfully.');
                    }
                });
                console.log('No config file found. Creating new one with default settings.');
                callback(null, defaultConfig);
        }
    });
    } catch (error) {
        console.error('Error checking config file:', error);
        callback(error);
    }
    
};

module.exports = {
    checkConfigFile,
};
