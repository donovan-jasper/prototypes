import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: 'YOUR_OPENAI_API_KEY',
});

export const parseNaturalLanguage = async (input: string) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that parses natural language into structured reminder data.',
        },
        {
          role: 'user',
          content: `Parse the following input into a structured reminder: "${input}"`,
        },
      ],
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error('AI parsing error:', error);
    return null;
  }
};

export const generateSuggestions = async (userHistory: any[]) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that suggests new reminders based on user history.',
        },
        {
          role: 'user',
          content: `Based on the following user history, suggest 3 new reminders: ${JSON.stringify(userHistory)}`,
        },
      ],
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content || '[]');
  } catch (error) {
    console.error('AI suggestion error:', error);
    return [];
  }
};
