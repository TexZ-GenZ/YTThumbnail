const fs = require('fs');
const fetch = require('node-fetch'); // Ensure you have `node-fetch` installed (npm install node-fetch)

/**
 * Sends an image to the Hugging Face inference API for caption generation.
 * @param {string} filename - The path to the image file.
 * @returns {Promise<string>} - The generated caption for the image.
 */
async function query(filename) {
  const data = fs.readFileSync(filename);
  
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large",
      {
        headers: {
          Authorization: "Bearer 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", // Replace with your API key
          "Content-Type": "application/json",
        },
        method: "POST",
        body: data,
      }
    );

    const result = await response.json();

    // Check if the result contains a caption
    if (result.error) {
      throw new Error(`Error from API: ${result.error}`);
    }
    console.log("Generated Caption:", JSON.stringify(result));
    return result[0]?.generated_text || "No caption generated";
  } catch (error) {
    console.error("Error fetching caption:", error);
    throw error;
  }
}

// Export the function for use in other files
module.exports = { query };
