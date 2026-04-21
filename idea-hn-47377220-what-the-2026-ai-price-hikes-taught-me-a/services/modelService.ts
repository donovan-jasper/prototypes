import { AIModel, Task, ModelRecommendation, TaskType } from '../types/models';
import modelsData from '../constants/models.json';
import { calculateCost } from './costCalculator';

const models: AIModel[] = modelsData as AIModel[];

export function matchModelsForTask(task: Task): ModelRecommendation[] {
  const compatibleModels = models.filter(model =>
    model.capabilities.includes(task.type)
  );

  const recommendations = compatibleModels.map(model => {
    const costEstimate = calculateCost(
      model,
      task.estimatedInputTokens,
      task.estimatedOutputTokens
    );

    // Efficiency score: balance of quality and cost
    const efficiencyScore = (model.qualityScore / 100) / (costEstimate * 100);

    let reasoning = `${model.name} offers `;
    if (model.qualityScore >= 90) {
      reasoning += 'excellent quality';
    } else if (model.qualityScore >= 80) {
      reasoning += 'good quality';
    } else {
      reasoning += 'decent quality';
    }
    reasoning += ` at $${costEstimate.toFixed(4)} per task.`;

    return {
      model,
      costEstimate,
      efficiencyScore,
      reasoning
    };
  });

  return rankByEfficiency(recommendations).slice(0, 3);
}

export function rankByEfficiency(recommendations: ModelRecommendation[]): ModelRecommendation[] {
  return recommendations.sort((a, b) => b.efficiencyScore - a.efficiencyScore);
}

export function getModelById(id: string): AIModel | undefined {
  return models.find(model => model.id === id);
}

export function getAllModels(): AIModel[] {
  return models;
}
