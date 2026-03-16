import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const analyzeImage = async (imageUri) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Extract the color palette (5 colors), typography characteristics (font style, weights, sizes), spacing patterns, and component styles from this UI screenshot. Return as JSON." },
            {
              type: "image_url",
              image_url: {
                "url": imageUri,
              },
            },
          ],
        },
      ],
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
};

export const suggestImprovements = async (system) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: `Analyze this design system for accessibility issues, color harmony, and usability. Suggest 3 specific improvements. Design system: ${JSON.stringify(system)}`,
        },
      ],
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error suggesting improvements:', error);
    throw error;
  }
};
