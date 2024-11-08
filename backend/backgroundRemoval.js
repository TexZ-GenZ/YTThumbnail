const express = require('express');
const multer = require('multer');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
require('dotenv').config();

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

async function removeBackground(imagePath) {
  const formData = new FormData();
  formData.append('size', 'auto');
  formData.append('image_file', fs.createReadStream(imagePath));

  const response = await fetch('https://api.remove.bg/v1.0/removebg', {
    method: 'POST',
    headers: {
      'X-Api-Key': process.env.REMOVE_BG_API_KEY,
      ...formData.getHeaders(),
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`remove.bg API error: ${response.statusText} - ${errorText}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

// API endpoint for handling image background removal
router.post('/remove-background', upload.single('image'), async (req, res) => {
  try {
    const imagePath = req.file.path;
    console.log(`Received image for background removal: ${imagePath}`);
    const imageWithNoBg = await removeBackground(imagePath);

    // Encode the image with no background as a base64 string
    const base64Image = imageWithNoBg.toString('base64');

    fs.unlinkSync(imagePath); // Clean up original uploaded file
    res.json({ base64Image }); // Send base64 image back to the frontend
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Failed to remove background: ${error.message}` });
  }
});

module.exports = router;
