const http = require('http');
const util = require('util');
const url = require('url');
const log = require('./loger')(module);
const fs = require('fs');

const PATH = 'files/';

const server = http.createServer((req, res) => {
    // log.error('It`s Error');
    // log.info('It`s info');
    console.log(req.method, req.url);
    const urlParse = url.parse(req.url, true);
    // log.info(util.inspect(urlParse));
    if (req.method === 'GET' && (req.url === '/' || req.url === '/favicon.ico' || req.url === '/robots.txt')) {
        res.end('First connect! What are your want?');
    } else if (req.method === 'GET') {
        let file = urlParse.path.split('/')[urlParse.path.split('/').length - 1];
        if (file.includes('.') && file !== '' && file !== 'favicon.ico') {
            const stream = fs.ReadStream(PATH + file, {encoding: 'utf-8'});
            let allFile = '';
            stream
                .on('readable', function() {
                    const data = stream.read();
                    if (data !== null) {
                        console.log('part', data);
                        allFile += data;
                        res.write(allFile);
                        allFile = '';
                    }
                })
                .on('error', function (err) {
                    if (err) throw err;
                })
                .on('end', function() {
                    res.end();
                })
        }
        // res.end('Hello client your say GET');
    } else if (req.method === 'POST') {
        // res.end('Hello client your say POST');
        let file = urlParse.path.split('/')[urlParse.path.split('/').length - 1];
        fs.stat(PATH + file, function (err, stats) {
            if (err && err.code === 'ENOENT') {
                let body = '';
                req
                    .on('readable', function() {
                        let chunk;
                        if (null !== (chunk = req.read())) {
                            body += chunk;
                            if (Buffer.from(body, 'utf-8').byteLength > 1e6) {
                                res.statusCode = 413;
                                res.end('Your message is to big' +
                                    'for my little storage');
                            }
                        }
                    })
                    .on('end', function() {
                        fs.writeFile(PATH + file, body, function (err) {
                            if (err) throw err;
                            res.statusCode = 200;
                            res.end('OK');
                        });
                    });
            } else {
                if (stats.isFile()) {
                    log.error('File already exists');
                    res.statusCode = 409;
                    res.end('File already exists');
                }
            }
        });
    } else if (req.method === 'DELETE') {
        let file = urlParse.path.split('/')[urlParse.path.split('/').length - 1];
        if (file.includes('.') && file !== '' && file !== 'favicon.ico') {
            fs.unlink(PATH + file, function (err) {
                if (err) {
                    log.error('File not found method DELETE');
                    res.statusCode = 404;
                    res.end('File not found');
                    return;
                }
                res.statusCode = 200;
                res.end(`Files/${file} is deleted`);
            });
        }
        // res.end('Hello client your say DELETE');
    } else {
        res.end('Hello client! What are your want?');
    }
});

module.exports = server;