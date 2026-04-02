import { processScriptToVideo } from './aiService';

const videoProcessor = {
  processScriptToVideo: async (script) => {
    try {
      const result = await processScriptToVideo(script);
      return result;
    } catch (error) {
      console.error(error);
      return null;
    }
  },
};

export default videoProcessor;
