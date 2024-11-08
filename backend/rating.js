const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function rateThumbnails(captions) {
  try {
    console.log("Preparing to send captions to Groq model for rating...");

    const prompts = captions.map(caption => `
      Rate this potential YouTube thumbnail caption based on the following criteria that make thumbnails engaging and effective. Consider how well the caption suggests the frame would work as a thumbnail.
      Context: The caption describes this frame: "${caption}"
      Evaluate on these specific factors:

      Emotional Impact (Does it suggest visible emotions, reactions, or engaging expressions?)
      Visual Interest (Does it describe visually striking or attention-grabbing elements?)
      Content Relevance (Does it capture a key moment or main theme?)
      Viewer Appeal (Would this caption attract clicks if shown as a thumbnail?)
      Brand Consistency (Does it align with typical YouTube thumbnail styles?)

      There should be a person or the scene should contain a object or anything that makes the image look cooler .
      If it is just an empty image or anything rate it low.

      If there is no human in the image rate it zero.
      if the human has good emotions rate it higher.
      Based on these criteria combined, provide a single integer score from 1-100 where:
      Output format: Return only a single integer (1-100) with no additional text or explanation.
      only return one single integer and nothing else, nothing.
    `);

    const ratingPromises = prompts.map(prompt =>
      groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "llama-3.2-3b-preview",
      })
    );

    const chatCompletions = await Promise.all(ratingPromises);

    const ratings = chatCompletions.map(chatCompletion => {
      const responseMessage = chatCompletion.choices[0]?.message?.content || "No response message found";
      console.log("Rating received:", responseMessage);
      return parseInt(responseMessage, 10);
    });

    return ratings;

  } catch (error) {
    console.error("Error rating thumbnails:", error);
    throw error;
  }
}

module.exports = { rateThumbnails };
