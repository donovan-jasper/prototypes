import OpenAI from 'openai';
import { convertImageToBase64 } from './imageAnalysis';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ImageAnalysisResponse {
  colors: string[];
  typography: {
    base: number;
    ratio: number;
    fontFamily?: string;
    weights?: number[];
  };
  spacing: {
    base: number;
    ratio: number;
  };
  components?: {
    buttons?: {
      primary: {
        background: string;
        text: string;
      };
      secondary: {
        background: string;
        text: string;
      };
    };
    cards?: {
      background: string;
      borderRadius: number;
      shadow: string;
    };
  };
}

export const analyzeImage = async (imageUri: string): Promise<ImageAnalysisResponse> => {
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
              text: `Analyze this UI screenshot and extract:
1. Color palette (5-7 hex colors)
2. Typography characteristics (base font size, scale ratio, font family, weights)
3. Spacing patterns (base spacing, scale ratio)
4. Common component styles (buttons, cards, etc.)

Return as JSON with this exact structure:
{
  "colors": ["#hex1", "#hex2", ...],
  "typography": {
    "base": number,
    "ratio": number,
    "fontFamily": "string",
    "weights": [number array]
  },
  "spacing": {
    "base": number,
    "ratio": number
  },
  "components": {
    "buttons": {
      "primary": {
        "background": "#hex",
        "text": "#hex"
      },
      "secondary": {
        "background": "#hex",
        "text": "#hex"
      }
    },
    "cards": {
      "background": "#hex",
      "borderRadius": number,
      "shadow": "string"
    }
  }
}

If you can't detect certain values, use reasonable defaults.`
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
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content;

    if (!content) {
      throw new Error('Empty response from API');
    }

    try {
      return JSON.parse(content) as ImageAnalysisResponse;
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

export const suggestImprovements = async (system: any): Promise<string> => {
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

export const generateSystemName = async (colors: string[]): Promise<string> => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `Generate a creative name for a design system with these colors: ${colors.join(', ')}. The name should be 2-3 words and describe the color palette. Examples: "Ocean Breeze", "Midnight Slate", "Sunset Glow".`,
        },
      ],
      max_tokens: 50,
    });

    return response.choices[0].message.content || 'Custom Design System';
  } catch (error) {
    console.error('Error generating system name:', error);
    return 'Custom Design System';
  }
};
