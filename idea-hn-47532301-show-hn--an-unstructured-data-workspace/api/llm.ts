import axios from 'axios';

const API_KEY = 'your-api-key-here'; // Replace with actual API key
const API_URL = 'https://api.openai.com/v1/chat/completions';

interface LLMResponse {
  entities: Array<{ type: string; value: string }>;
  summary?: string;
}

export const extractWithLLM = async (text: string): Promise<LLMResponse> => {
  try {
    const response = await axios.post(
      API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a data extraction assistant. Extract entities like emails, dates, phone numbers, monetary values, and names from the text. Also provide a concise summary of the text. Format your response as JSON with "entities" and "summary" fields.'
          },
          {
            role: 'user',
            content: `Extract entities and provide a summary from this text: ${text}`
          }
        ],
        max_tokens: 200,
        response_format: { type: "json_object" }
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('LLM API error:', error);
    throw error;
  }
};
