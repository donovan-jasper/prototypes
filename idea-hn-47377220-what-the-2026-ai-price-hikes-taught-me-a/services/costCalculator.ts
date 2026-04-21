import { AIModel } from '../types/models';

export function calculateCost(model: AIModel, inputTokens: number, outputTokens: number): number {
  const inputCost = (inputTokens / 1000) * model.inputCostPer1k;
  const outputCost = (outputTokens / 1000) * model.outputCostPer1k;
  return inputCost + outputCost;
}

export function projectMonthlyCost(dailyData: Array<{ date: string; cost: number }>): number {
  if (dailyData.length === 0) return 0;

  // Calculate average daily cost
  const totalCost = dailyData.reduce((sum, day) => sum + day.cost, 0);
  const averageDailyCost = totalCost / dailyData.length;

  // Get current date and days remaining in month
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysPassed = now.getDate();
  const daysRemaining = daysInMonth - daysPassed;

  // Projected cost = current total + (average daily cost * days remaining)
  return totalCost + (averageDailyCost * daysRemaining);
}
