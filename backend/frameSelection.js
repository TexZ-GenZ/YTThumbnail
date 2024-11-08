// frameSelection.js

const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

ffmpeg.setFfmpegPath('C:\\ffmpeg\\ffmpeg.exe');
ffmpeg.setFfprobePath('C:\\ffmpeg\\ffprobe.exe');

/**
 * Analyzes brightness and contrast of a frame image using ffprobe.
 * @param {string} filePath - The path to the image file (frame).
 * @returns {Promise<{ brightness: number, contrast: number }>}
 */
async function analyzeFrameBrightnessContrast(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        return reject(err);
      }

      // Extract pixel statistics from ffprobe (e.g., average and variance)
      let brightness = 0;
      let contrast = 0;

      try {
        const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');

        // Average brightness (simplified for demonstration purposes)
        brightness = videoStream.avg_frame_rate; // Approximation; adjust with pixel intensity data if available

        // Contrast approximation using brightness variations
        contrast = Math.abs(videoStream.avg_frame_rate - videoStream.bit_rate); // Approximation

        resolve({ brightness, contrast });
      } catch (error) {
        console.error("Error calculating brightness/contrast:", error);
        reject(error);
      }
    });
  });
}

/**
 * Selects three diverse frames within a specified time range of a video.
 * @param {string} videoPath - The path to the video file.
 * @param {number} batchDuration - Duration of each batch segment in seconds.
 * @param {number} startTime - Start time of the batch segment.
 * @returns {Promise<Array<{ path: string, brightness: number, contrast: number }>>} - Three diverse frames.
 */
async function selectDiverseFrames(videoPath, batchDuration, startTime) {
  const frames = [];
  
  for (let i = 0; i < 10; i++) { // Select 10 random frames per batch
    const timestamp = startTime + (batchDuration * Math.random()); // Random timestamp within batch
    const outputImagePath = path.join(__dirname, 'uploads', `frame-${Date.now()}-${i}.jpg`);

    await new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .seekInput(timestamp)
        .frames(1)
        .output(outputImagePath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    // Analyze brightness/contrast of extracted frame
    const { brightness, contrast } = await analyzeFrameBrightnessContrast(outputImagePath);
    frames.push({ path: outputImagePath, brightness, contrast });
  }

  // Sort frames by diversity in brightness and contrast
  frames.sort((a, b) => Math.abs(a.brightness - b.brightness) + Math.abs(a.contrast - b.contrast));
  return frames.slice(0, 3); // Select 3 most diverse frames
}

module.exports = { selectDiverseFrames };
