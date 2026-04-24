import axios from 'axios';

const API_KEY = 'your-api-key';
const API_URL = 'https://api.openai.com/v1/engines/davinci-codex/completions';

const callLLM = async (text) => {
  const response = await axios.post(
    API_URL,
    {
      prompt: text,
      max_tokens: 150,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
    }
  );
  return response.data.choices[0].text;
};

export default callLLM;
