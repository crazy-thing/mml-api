const fs = require('fs');
const path = require('path');

const logDir = path.join(process.cwd(), 'logs');

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const logStream = fs.createWriteStream(path.join(logDir, `${new Date().toDateString()}.log`), { flags: 'a' });

const logger = (req, res, next) => {
    let ip = req.ip;

    const currentDate = new Date().toDateString();
    const logFileName = `${currentDate}.log`;

    if (!logger.logStream || logger.currentDate !== currentDate) {
        if (logger.logStream) {
            logger.logStream.end();
        }
        logger.logStream = fs.createWriteStream(path.join(logDir, logFileName), { flags: 'a' });
        logger.currentDate = currentDate;
    }

    if (ip.includes('::ffff')) {
        ip = ip.substring(7);
    } 

    const start = new Date();

    res.on('finish', () => {
        const end = new Date();
        const duration = end - start;
        const status = res.statusCode;
        const success = status >= 200 && status < 400 ? 'SUCCESS' : 'FAILURE';
        const logMsg = `${end.toLocaleString()} - ${req.method} ${req.originalUrl} - IP: ${ip} - Status: ${status} - ${success} - Duration: ${duration}ms\n`;
        logStream.write(logMsg, 'utf8');
    });

    next();
}

module.exports = logger;