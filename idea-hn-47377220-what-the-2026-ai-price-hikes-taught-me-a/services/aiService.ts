import axios from 'axios';

const apiEndpoint = 'https://your-ai-api.com/recommendation';

export async function getAIRecommendation(taskDescription: string, models: any[]): Promise<string> {
  try {
    const response = await axios.post(apiEndpoint, {
      taskDescription,
      models,
    });
    return response.data.recommendation;
  } catch (error) {
    throw new Error('Failed to get AI recommendation');
  }
}
