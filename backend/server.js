// server.js

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
require('dotenv').config();
const cors = require('cors');
const { rateThumbnails } = require('./rating.js'); 
const { query } = require('./imageCaptioning');
const { selectDiverseFrames } = require('./frameSelection');
const app = express();
const backgroundRemoval = require('./backgroundRemoval');


const http = require('http');
const WebSocket = require('ws');
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

ffmpeg.setFfmpegPath('C:\\ffmpeg\\ffmpeg.exe');
ffmpeg.setFfprobePath('C:\\ffmpeg\\ffprobe.exe');

app.use(cors({
  origin: 'http://localhost:3002', // Replace with your frontend's address
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

const upload = multer({ dest: 'uploads/' });

app.use((req, res, next) => {
  let totalBytes = 0;
  req.on('data', (chunk) => {
    totalBytes += chunk.length;
    const progress = Math.round((totalBytes / req.headers['content-length']) * 100);

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ uploadProgress: progress }));
      }
    });
  });
  next();
});

wss.on('connection', (ws) => {
  console.log("WebSocket client connected");
  ws.on('message', (message) => console.log(`Received: ${message}`));
  ws.send(JSON.stringify({ message: 'WebSocket connected' }));
});

app.use('/api', backgroundRemoval); // Add this line to register the background removal API

app.post('/api/thumbnail', upload.single('video'), async (req, res) => {
  const videoPath = req.file.path;

  try {
    const videoDuration = await new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) reject(err);
        else resolve(metadata.format.duration);
      });
    });

    const totalBatches = 10;
    const batchDuration = videoDuration / totalBatches;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Transfer-Encoding', 'chunked');

    for (let startBatch = 0; startBatch < totalBatches; startBatch++) {
      const batchIndices = [
        startBatch % totalBatches,
        (startBatch + 1) % totalBatches,
        (startBatch + 2) % totalBatches
      ];

      const frames = [];

      for (const batch of batchIndices) {
        const startTime = batch * batchDuration;
        const selectedFrames = await selectDiverseFrames(videoPath, batchDuration, startTime);
        frames.push(...selectedFrames);
      }

      const captions = await Promise.all(frames.map(frame => query(frame.path)));
      const ratings = await rateThumbnails(captions);

      const bestFrameIndex = ratings.indexOf(Math.max(...ratings));
      const bestFrame = frames[bestFrameIndex];
      const caption = captions[bestFrameIndex];

      const imageBuffer = fs.readFileSync(bestFrame.path);
      const thumbnail = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

      const responseChunk = JSON.stringify({ thumbnail, caption, rating: ratings[bestFrameIndex] });
      res.write(responseChunk + "\n");

      frames.forEach(frame => fs.unlinkSync(frame.path));

      const progress = ((startBatch + 1) * 100) / totalBatches;
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ progress }));
        }
      });
    }

    fs.unlinkSync(videoPath);
    res.end();

  } catch (error) {
    console.error('Error processing video:', error);
    res.status(500).send('Failed to process video');
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

const port = process.env.PORT || 3001;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
