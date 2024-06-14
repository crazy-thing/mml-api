const fs = require('fs');
const path = require('path');

const apiTokenFilePath = path.join(process.cwd(), './apiToken.json');

const authenticateApiKey = (req, res, next) => {
    fs.readFile(apiTokenFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading API token file:', err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
        
        try {
            const { token } = JSON.parse(data);
            

            const apiKey = req.headers['x-api-key'];
            
            if (!apiKey) {
                return res.status(401).json({ message: 'API key is required' });
            }

            if (apiKey !== token) {
                return res.status(401).json({ message: 'Invalid API key' });
            }

            next();
        } catch (parseError) {
            console.error('Error parsing API token file:', parseError);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    });
};


module.exports = {
    authenticateApiKey,
};