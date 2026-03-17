import axios from 'axios';
import { ModelRecommendation } from '../types/models';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'your-api-key-here';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export async function getAIRecommendation(
  taskDescription: string,
  recommendations: ModelRecommendation[]
): Promise<string> {
  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an AI cost optimization assistant. Analyze the given task and model recommendations, then provide a concise recommendation (1-2 sentences) about which model to choose and why. Be specific about cost savings or quality improvements.`
          },
          {
            role: 'user',
            content: `Task: ${taskDescription}\n\nModel Recommendations:\n${recommendations.map((rec, i) =>
              `${i+1}. ${rec.model.name}: $${rec.costEstimate.toFixed(4)} (${rec.model.speedRating} speed, ${rec.model.qualityScore}/100 quality)`
            ).join('\n')}`
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        }
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error getting AI recommendation:', error);
    return 'Based on your task and available models, the top recommendation is the most cost-effective option that meets your quality needs.';
  }
}

export async function getCostProjection(
  usageHistory: Array<{ date: string; cost: number }>,
  currentMonth: boolean = true
): Promise<{ projectedCost: number; savingsOpportunities: string[] }> {
  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an AI cost optimization assistant. Analyze the given spending history and provide:
            1. A projected cost for the current month
            2. 2-3 specific savings opportunities based on patterns in the data`
          },
          {
            role: 'user',
            content: `Spending History:\n${usageHistory.map(entry =>
              `${entry.date}: $${entry.cost.toFixed(2)}`
            ).join('\n')}\n\nCurrent month: ${currentMonth ? 'Yes' : 'No'}`
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        }
      }
    );

    const content = response.data.choices[0].message.content;
    const lines = content.split('\n');

    // Parse the response (simplified - in production you'd want more robust parsing)
    const projectedCost = parseFloat(lines[0].match(/\$([\d.]+)/)?.[1] || '0');
    const savingsOpportunities = lines.slice(1).filter(line => line.trim() !== '');

    return {
      projectedCost,
      savingsOpportunities
    };
  } catch (error) {
    console.error('Error getting cost projection:', error);
    return {
      projectedCost: usageHistory.reduce((sum, entry) => sum + entry.cost, 0) * (currentMonth ? 1 : 1.1),
      savingsOpportunities: [
        'Consider switching to cheaper models for repetitive tasks',
        'Review your usage patterns for unusually high costs',
        'Set up budget alerts to stay within your spending limits'
      ]
    };
  }
}
