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
            content: 'You are a data extraction assistant. Extract entities like emails, dates, phone numbers, and monetary values from the text.'
          },
          {
            role: 'user',
            content: `Extract entities from this text: ${text}`
          }
        ],
        max_tokens: 150
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0].message.content;
    // Parse the LLM response into structured data
    // This would need a proper parser based on your LLM's output format
    return parseLLMResponse(content);
  } catch (error) {
    console.error('LLM API error:', error);
    throw error;
  }
};

function parseLLMResponse(content: string): LLMResponse {
  // Simple parser - in production you'd want a more robust solution
  const entities: Array<{ type: string; value: string }> = [];
  const lines = content.split('\n');

  for (const line of lines) {
    if (line.includes('Email:')) {
      entities.push({ type: 'email', value: line.split('Email:')[1].trim() });
    } else if (line.includes('Date:')) {
      entities.push({ type: 'date', value: line.split('Date:')[1].trim() });
    } else if (line.includes('Phone:')) {
      entities.push({ type: 'phone', value: line.split('Phone:')[1].trim() });
    } else if (line.includes('Amount:')) {
      entities.push({ type: 'amount', value: line.split('Amount:')[1].trim() });
    }
  }

  return { entities };
}
