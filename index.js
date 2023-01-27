const express = require('express');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const fs = require('fs');
// const http = require('http');
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
    

});



app.get('/status', (req, res) => {
  res.send(
    `<h1 style='text-align: center'>
      🎉Server is runningssss🎉
    </h1>`
);

});