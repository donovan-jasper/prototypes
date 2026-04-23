import OpenAI from 'openai';
import { TriggerType } from './types';

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

interface ParsedMemory {
  title: string;
  description: string;
  triggerType: TriggerType;
  triggerValue: string;
}

export const parseNaturalLanguage = async (input: string): Promise<ParsedMemory> => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant that parses natural language reminders into structured data.
          For each input, extract:
          1. A title (short summary)
          2. A description (full details)
          3. Trigger type (time, location, or routine)
          4. Trigger value (specific time, location name, or routine description)

          Return the result as a JSON object with these fields: title, description, triggerType, triggerValue.`
        },
        {
          role: 'user',
          content: input
        }
      ],
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    const parsed = JSON.parse(content);
    return {
      title: parsed.title || 'New Memory',
      description: parsed.description || input,
      triggerType: parsed.triggerType || 'time',
      triggerValue: parsed.triggerValue || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error parsing natural language:', error);
    // Fallback to basic parsing if AI fails
    return {
      title: input.split(' ').slice(0, 5).join(' ') + '...',
      description: input,
      triggerType: 'time',
      triggerValue: new Date().toISOString()
    };
  }
};

export const generateSuggestions = async (userHistory: ParsedMemory[]): Promise<ParsedMemory[]> => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant that suggests new reminders based on user history.
          Analyze the user's past reminders and suggest 3-5 new reminders that would be helpful.
          For each suggestion, provide:
          1. A title
          2. A description
          3. Trigger type (time, location, or routine)
          4. Trigger value (specific time, location name, or routine description)

          Return the result as a JSON array of objects with these fields: title, description, triggerType, triggerValue.`
        },
        {
          role: 'user',
          content: `Here are my past reminders: ${JSON.stringify(userHistory)}`
        }
      ],
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    const suggestions = JSON.parse(content);
    return suggestions.map((suggestion: any) => ({
      title: suggestion.title || 'New Suggestion',
      description: suggestion.description || '',
      triggerType: suggestion.triggerType || 'time',
      triggerValue: suggestion.triggerValue || new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error generating suggestions:', error);
    // Fallback to basic suggestions if AI fails
    return [
      {
        title: 'Take a walk',
        description: 'Get some fresh air and exercise',
        triggerType: 'time',
        triggerValue: new Date(Date.now() + 86400000).toISOString() // Tomorrow
      },
      {
        title: 'Drink water',
        description: 'Stay hydrated throughout the day',
        triggerType: 'routine',
        triggerValue: 'Every 2 hours'
      }
    ];
  }
};
