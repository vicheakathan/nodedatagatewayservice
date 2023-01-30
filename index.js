const express = require('express');
const fs = require('fs');
const http = require('http');
const app = express();
// const cors = require('cors');
const port = 3000;
const path = require('path');
const url = require("url");

// app.use(cors({ origin: '*' }));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "*");
    next();
});

app.listen(port, () => {
  console.log("🎉Server is running🎉");
});

app.get("/", (req, res) => {
    res.send(
        `<meta name="color-scheme" content="light dark">
        <h1 style='text-align: center'>
            🔥NodeJs server is running🔥
        </h1>`
    );
});

let uploads = {};

app.post('/upload', (req, res, next) => {
    let fileId = req.headers['x-file-id'];
    let startByte = parseInt(req.headers['x-start-byte'], 10);
    let name = req.headers['name'];
    let fileSize = parseInt(req.headers['size'], 10);
    console.log('file Size', fileSize, fileId, startByte);
    if (uploads[fileId] && fileSize == uploads[fileId].bytesReceived) {
        res.end();
        return;
    }

    console.log(fileId);

    if (!fileId) {
        res.writeHead(400, "No file id");
        res.end(400);
    }

    console.log(uploads[fileId]);
    if (!uploads[fileId])
        uploads[fileId] = {};

    let upload = uploads[fileId];
    let fileStream;

    if (!startByte) {
        upload.bytesReceived = 0;
        let name = req.headers['name'];
        fileStream = fs.createWriteStream(`./assets/images/${name}`, {
            flags: 'w' 
        });
    } else {
        if (upload.bytesReceived != startByte) {
            res.writeHead(400, "Wrong start byte");
            res.end(upload.bytesReceived);
            return;
        }
        fileStream = fs.createWriteStream(`./assets/images/${name}`, {
            flags: 'a'
        });
    }

    req.on('data', function (data) {
        upload.bytesReceived += data.length; 
    });

    req.pipe(fileStream);

    fileStream.on('close', function () {
        console.log(upload.bytesReceived, fileSize);
        if (upload.bytesReceived == fileSize) {
            console.log("Upload finished");
            delete uploads[fileId];

            res.send({ 'status': 'uploaded' });
            res.end();
        } else {
            console.log("File unfinished, stopped at " + upload.bytesReceived);
            res.writeHead(500, "Server Error");
            res.end();
        }
    });

    fileStream.on('error', function (err) {
        console.log("fileStream error", err);
        res.writeHead(500, "File error");
        res.end();
    });

});



app.get('/status', (req, res) => {
    //console.log('Successfully came');
    //From GET request 3 parameters below and store in variable
    let fileId = req.headers['x-file-id'];
    let name = req.headers['name'];
    let fileSize = parseInt(req.headers['size'], 10);
    console.log(name);
    if (name) {
        try {
            let stats = fs.statSync('./assets/images/' + name); //grabs file information and returns
            //checking file exists or not
            // if (stats.isFile()) {
            //     console.log(`fileSize is ${fileSize} and already uploaded file size ${stats.size}`);
            //     if (fileSize == stats.size) {
            //         res.send({ 'status': 'file is present' }) //returns if file exists
            //         return;
            //     }
            //     if (!uploads[fileId])
            //         uploads[fileId] = {}
            //     console.log(uploads[fileId]);
            //     uploads[fileId]['bytesReceived'] = stats.size;//checks total amount of file uploaded
            //     console.log(uploads[fileId], stats.size);
            // }
        } catch (er) {

        }

    }
    let upload = uploads[fileId];
    if (upload)
        res.send({ "uploaded": upload.bytesReceived });//returns to FrontEnd amout of bytes uploaded
    else
        res.send({ "uploaded": 0 });

});


// view image 
app.get('/assets/images/:id', (req, res) => {
    var request = url.parse(req.url, true);
    var action = request.pathname;
    var filePath = path.join(__dirname, action).split("%20").join(" ");

    fs.exists(filePath, function (exists) {
        if (!exists) {
            res.writeHead(404, {
                "Content-Type": "text/plain" });
            res.end("404 Not Found");
            return;
        }
 
        var extname = path.extname(action);
        var contentType = "text/plain";
        switch (extname) {
            case '.png':
                contentType = 'image/png';
                break;      
            case '.jpg':
                contentType = 'image/jpg';
                break;
            case '.jpeg':
                contentType = 'image/jpeg';
                break;
            case '.ico':
                contentType = 'image/x-ico';
                break;
            case '.svg':
                contentType = 'image/svg+xml';
                break;
        }
 
        res.writeHead(200, {"Content-Type": contentType });
 
        fs.readFile(filePath, function (err, content) {
            res.end(content);
        });
    });
});



// view index of file image
// app.get('/assets/images', (req, res) => {
//     try {
//         req_url = decodeURIComponent(req.url).replace(/\/+/g, '/');
//         stats = fs.statSync(__dirname + req_url);
//         var HOST = req.get('host');

//         lsof = fs.readdirSync(__dirname + req_url, {encoding:'utf8', withFileTypes:false});
//         res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
//         res.end(html_page(req.protocol + '://' + HOST, req_url, lsof));
//         return;
//     } catch (err) {
//         res.writeHead(404);
//         res.end(err);
//         return;
//     }
// });

// function html_page(host, req_url, lsof) {
//     list = [];

//     templete = (host, req_url, file) => {
//         return `
//             <li><a class="icon file" href="${host}${encodeURI(req_url)}${req_url.slice(-1) == '/' ? '' : '/'}${encodeURI(file)}">${file}</a></li>
//         `;
//     }
  
//     lsof.forEach(file => {
//       list.push(templete(host, req_url, file));
//     });
  
//     return `
//     <!DOCTYPE html>
//     <html lang="en">
//     <head>
//         <meta name="color-scheme" content="light dark">
//         <meta http-equiv="content-type" content="text/html" charset="utf-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1">
//         <style>
//             h1 {
//                 border-bottom: 1px solid #c0c0c0;
//                 margin-bottom: 10px;
//                 padding-bottom: 10px;
//                 white-space: nowrap;
//             }
//             a.file {
//                 background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAABnRSTlMAAAAAAABupgeRAAABEElEQVR42nRRx3HDMBC846AHZ7sP54BmWAyrsP588qnwlhqw/k4v5ZwWxM1hzmGRgV1cYqrRarXoH2w2m6qqiqKIR6cPtzc3xMSML2Te7XZZlnW7Pe/91/dX47WRBHuA9oyGmRknzGDjab1ePzw8bLfb6WRalmW4ip9FDVpYSWZgOp12Oh3nXJ7nxoJSGEciteP9y+fH52q1euv38WosqA6T2gGOT44vry7BEQtJkMAMMpa6JagAMcUfWYa4hkkzAc7fFlSjwqCoOUYAF5RjHZPVCFBOtSBGfgUDji3c3jpibeEMQhIMh8NwshqyRsBJgvF4jMs/YlVR5KhgNpuBLzk0OcUiR3CMhcPaOzsZiAAA/AjmaB3WZIkAAAAASUVORK5CYII=) left top no-repeat;
//             }
//             a.icon {
//                 padding-inline-start: 1.5em;
//                 text-decoration: none;
//                 user-select: auto;
//             }
//             ul,li{
//                 list-style-type: decimal
//             }
//         </style>
//         <title>Index of ${host + req_url}</title>
//     </head>
//     <body>
//     <h1>Index of ${host + req_url}</h1>
//         <a href="${host}">/...</a>
//         <ul>
//             ${list.join('')}
//         </ul>
//     </body>
//     </html>`;
// }
