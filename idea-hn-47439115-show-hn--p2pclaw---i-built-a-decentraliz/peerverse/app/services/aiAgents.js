import axios from 'axios';

const AI_API_URL = 'https://api-inference.huggingface.co/models/';

export const getAISuggestions = async (paperContent) => {
  try {
    const response = await axios.post(`${AI_API_URL}text-generation`, {
      inputs: paperContent,
    }, {
      headers: {
        'Authorization': 'Bearer YOUR_HUGGINGFACE_API_KEY',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching AI suggestions:', error);
    throw error;
  }
};
