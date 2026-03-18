import OpenAI from 'openai';
import { convertImageToBase64 } from './imageAnalysis';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const analyzeImage = async (imageUri: string) => {
  try {
    const base64Data = await convertImageToBase64(imageUri);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: "Extract the color palette (5 colors as hex codes), typography characteristics (font style, weights, sizes with base size and scale ratio), spacing patterns (base spacing and ratio), and component styles from this UI screenshot. Return as JSON with this exact structure: {colors: [string array of hex codes], typography: {base: number, ratio: number}, spacing: {base: number, ratio: number}}. If you cannot detect certain values, use reasonable defaults." 
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Data}`,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    });

    const content = response.choices[0].message.content;
    
    if (!content) {
      throw new Error('Empty response from API');
    }

    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse API response:', content);
      throw new Error('Invalid response format from API');
    }
  } catch (error) {
    console.error('Error analyzing image:', error);
    
    if (error.status === 429) {
      throw new Error('API rate limit exceeded. Please try again in a few moments.');
    }
    
    if (error.status === 401) {
      throw new Error('API authentication failed. Please check your API key.');
    }
    
    if (error.message?.includes('Invalid response format')) {
      throw error;
    }
    
    throw new Error('Failed to analyze image. Please try again.');
  }
};

export const suggestImprovements = async (system: any) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: `Analyze this design system for accessibility issues, color harmony, and usability. Suggest 3 specific improvements. Design system: ${JSON.stringify(system)}`,
        },
      ],
      max_tokens: 500,
    });

    return response.choices[0].message.content || 'No suggestions available.';
  } catch (error) {
    console.error('Error suggesting improvements:', error);
    
    if (error.status === 429) {
      throw new Error('API rate limit exceeded. Please try again in a few moments.');
    }
    
    throw new Error('Failed to generate suggestions. Please try again.');
  }
};
