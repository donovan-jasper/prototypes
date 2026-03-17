import { AIModel } from '../types/models';
import { getAIRecommendation } from './aiService';

export function calculateCost(
  model: AIModel,
  inputTokens: number,
  outputTokens: number
): number {
  const inputCost = (inputTokens / 1000) * model.inputCostPer1k;
  const outputCost = (outputTokens / 1000) * model.outputCostPer1k;
  return inputCost + outputCost;
}

export function estimateTokens(text: string): number {
  // Rough estimation: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4);
}

export async function projectMonthlyCost(
  history: Array<{ date: string; cost: number }>,
  currentMonth: boolean = true
): Promise<{ projectedCost: number; savingsOpportunities: string[] }> {
  if (history.length === 0) {
    return {
      projectedCost: 0,
      savingsOpportunities: []
    };
  }

  // Get AI projection
  const { projectedCost, savingsOpportunities } = await getCostProjection(history, currentMonth);

  return {
    projectedCost,
    savingsOpportunities
  };
}

export function calculateSavings(
  currentModel: AIModel,
  alternativeModel: AIModel,
  inputTokens: number,
  outputTokens: number
): number {
  const currentCost = calculateCost(currentModel, inputTokens, outputTokens);
  const alternativeCost = calculateCost(alternativeModel, inputTokens, outputTokens);
  return currentCost - alternativeCost;
}

export async function getCostRecommendation(
  taskDescription: string,
  currentModel: AIModel,
  alternatives: AIModel[],
  inputTokens: number,
  outputTokens: number
): Promise<string> {
  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an AI cost optimization assistant. Analyze the given task and model options, then provide a concise recommendation (1-2 sentences) about which model to choose and why, considering both cost and quality.`
          },
          {
            role: 'user',
            content: `Task: ${taskDescription}\n\nCurrent Model: ${currentModel.name} ($${calculateCost(currentModel, inputTokens, outputTokens).toFixed(4)})\n\nAlternative Models:\n${alternatives.map(model =>
              `${model.name}: $${calculateCost(model, inputTokens, outputTokens).toFixed(4)} (${model.speedRating} speed, ${model.qualityScore}/100 quality)`
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
    console.error('Error getting cost recommendation:', error);
    return `Based on your task and available models, ${currentModel.name} is currently the most cost-effective option.`;
  }
}
