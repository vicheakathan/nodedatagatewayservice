const express = require('express');
// const bodyParser = require('body-parser');
// const cors = require('cors');
const fs = require('fs');
const http = require('http');
const app = express();
const port = 3000;

// app.use(cors({ origin: '*' }));
// app.use(bodyParser.urlencoded({ extended: true }));

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

  let upload = uploads[fileId]; //Bytes of file already present

  let fileStream;

  //checking bytes of file uploaded and sending to server
  if (!startByte) {
      upload.bytesReceived = 0;
      let name = req.headers['name'];
      fileStream = fs.createWriteStream(`../src/assets/images/${name}`, {
          flags: 'w' //with "w"(write stream ) it keeps on adding data
      });
  } else {
      if (upload.bytesReceived != startByte) {//if same name file is sent with different size it will not upload
          res.writeHead(400, "Wrong start byte");
          res.end(upload.bytesReceived);
          return;
      }
      // append to existing file
      fileStream = fs.createWriteStream(`../src/assets/images/${name}`, {
          flags: 'a'
      });
  }

  req.on('data', function (data) {
      upload.bytesReceived += data.length; //adding length of data we are adding
  });

  req.pipe(fileStream);

  // when the request is finished, and all its data is written
  fileStream.on('close', function () {
      console.log(upload.bytesReceived, fileSize);
      if (upload.bytesReceived == fileSize) {
          console.log("Upload finished");
          delete uploads[fileId];

          // can do something else with the uploaded file here
          res.send({ 'status': 'uploaded' });
          res.end();
      } else {
          // connection lost, leave the unfinished file around
          console.log("File unfinished, stopped at " + upload.bytesReceived);
          res.writeHead(500, "Server Error");
          res.end();
      }
  });

  // in case of I/O error - finish the request
  fileStream.on('error', function (err) {
      console.log("fileStream error", err);
      res.writeHead(500, "File error");
      res.end();
  });

});



app.get('/status', (req, res) => {
  res.send(
    `<h1 style='text-align: center'>
      🎉Server is runningssss🎉
    </h1>`
);

});