const express = require('express');
const fs = require('fs');
const http = require('http');
const app = express();
// const cors = require('cors');
const port = 3000;
const path = require('path');
const url = require("url");


// app.use(cors({ origin: '*' }));

app.listen(port, () => {
  console.log("🎉Server is running🎉");
});

app.get("/", (req, res) => {
  res.send(
      `<h1 style='text-align: center'>
        🎉Server is running🎉
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
 
        var ext = path.extname(action);
        var contentType = "text/plain";
        if (ext === ".png") {
            contentType = "image/png";
        }
 
        res.writeHead(200, {"Content-Type": contentType });
 
        fs.readFile(filePath, function (err, content) {
            res.end(content);
        });
    });
});