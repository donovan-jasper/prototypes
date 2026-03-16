import axios from 'axios';

const OPENAI_API_KEY = 'your-api-key-here';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export const callOpenAI = async (messages: any[]) => {
  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-4',
        messages,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
};
