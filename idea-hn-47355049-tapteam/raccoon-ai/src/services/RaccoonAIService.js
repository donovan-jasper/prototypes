import axios from 'axios';

class RaccoonAIService {
  static async processMessage(message) {
    const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY';
    const url = 'https://api.openai.com/v1/completions';
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    };
    const data = {
      'model': 'text-davinci-003',
      'prompt': message,
      'temperature': 0.7,
      'max_tokens': 2048,
      'top_p': 1,
      'frequency_penalty': 0,
      'presence_penalty': 0,
    };

    try {
      const response = await axios.post(url, data, { headers });
      const result = response.data.choices[0].text;
      return result;
    } catch (error) {
      console.error(error);
      return 'Error processing message';
    }
  }
}

export default RaccoonAIService;
