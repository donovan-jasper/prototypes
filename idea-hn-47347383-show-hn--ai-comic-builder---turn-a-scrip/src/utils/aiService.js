import axios from 'axios';

const aiService = {
  processScriptToVideo: async (script) => {
    try {
      const response = await axios.post('https://api.example.com/process-script', {
        script,
      });
      return response.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  },
};

export default aiService;
