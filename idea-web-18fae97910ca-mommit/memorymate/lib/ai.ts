import OpenAI from 'openai';
import * as SecureStore from 'expo-secure-store';

const OPENAI_API_KEY_STORAGE = 'openai_api_key';

export const getApiKey = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(OPENAI_API_KEY_STORAGE);
  } catch (error) {
    console.error('Error retrieving API key:', error);
    return null;
  }
};

export const setApiKey = async (apiKey: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(OPENAI_API_KEY_STORAGE, apiKey);
  } catch (error) {
    console.error('Error storing API key:', error);
  }
};

export const parseNaturalLanguage = async (input: string) => {
  try {
    const apiKey = await getApiKey();
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const openai = new OpenAI({
      apiKey,
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant that parses natural language into structured reminder data.
Extract the following fields:
- title: A short title for the reminder (string)
- description: A detailed description (string)
- trigger_type: One of "time", "location", or "routine"
- trigger_value: For "time" triggers, use ISO 8601 format (e.g., "2026-03-19T17:00:00.000Z"). For "location" triggers, use coordinates as "lat,lng" (e.g., "37.7749,-122.4194"). For "routine" triggers, use a descriptive string (e.g., "every Monday morning").

Examples:
Input: "Remind me to call mom tomorrow at 5 PM"
Output: {"title": "Call mom", "description": "Remind me to call mom", "trigger_type": "time", "trigger_value": "2026-03-19T17:00:00.000Z"}

Input: "Buy milk when I'm near the grocery store"
Output: {"title": "Buy milk", "description": "Buy milk when I'm near the grocery store", "trigger_type": "location", "trigger_value": "37.7749,-122.4194"}

Input: "Review weekly goals every Monday morning"
Output: {"title": "Review weekly goals", "description": "Review weekly goals every Monday morning", "trigger_type": "routine", "trigger_value": "every Monday morning"}`,
        },
        {
          role: 'user',
          content: `Parse the following input into a structured reminder: "${input}"`,
        },
      ],
      response_format: { 
        type: 'json_schema',
        json_schema: {
          name: 'reminder_schema',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              trigger_type: { 
                type: 'string',
                enum: ['time', 'location', 'routine']
              },
              trigger_value: { type: 'string' }
            },
            required: ['title', 'description', 'trigger_type', 'trigger_value'],
            additionalProperties: false
          }
        }
      },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      return null;
    }

    const parsed = JSON.parse(content);
    
    // Validate required fields
    if (!parsed.title || !parsed.description || !parsed.trigger_type || !parsed.trigger_value) {
      return null;
    }

    // Validate trigger_type
    if (!['time', 'location', 'routine'].includes(parsed.trigger_type)) {
      return null;
    }

    return parsed;
  } catch (error) {
    console.error('AI parsing error:', error);
    return null;
  }
};

export const generateSuggestions = async (userHistory: any[]) => {
  try {
    const apiKey = await getApiKey();
    if (!apiKey) {
      return [];
    }

    const openai = new OpenAI({
      apiKey,
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that suggests new reminders based on user history. Return an array of 3 reminder suggestions.',
        },
        {
          role: 'user',
          content: `Based on the following user history, suggest 3 new reminders: ${JSON.stringify(userHistory)}`,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      return [];
    }

    const parsed = JSON.parse(content);
    return parsed.suggestions || [];
  } catch (error) {
    console.error('AI suggestion error:', error);
    return [];
  }
};
