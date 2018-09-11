const winston = require('winston');

const myFormat = function (fileName) {
    return winston.format.printf(info => {
        return `${info.timestamp} [${fileName}] ${info.level}: ${info.message}`;
    });
};

module.exports = function(module) {
    const moduleName = module.filename;
    const fileName = moduleName.split('/')[moduleName.split('/').length - 1];
    return winston.createLogger({
        level: 'info',
        format: winston.format.combine(
            winston.format.json(),
            winston.format.timestamp(),
            myFormat(fileName)
        ),
        transports: [
            //
            // - Write to all logs with level `info` and below to `combined.log`
            // - Write all logs error (and below) to `error.log`.
            //
            new winston.transports.File({filename: 'error.log', level: 'error'}),
            new winston.transports.File({filename: 'combined.log'})
        ]
    });
};

