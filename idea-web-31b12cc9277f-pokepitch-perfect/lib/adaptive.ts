import { Drill, DrillResult } from './types';

interface DifficultyAdjustment {
  newDifficulty: number;
  shouldAdjust: boolean;
}

export const adjustDifficulty = (drill: Drill, results: DrillResult[]): DifficultyAdjustment => {
  // Only consider the last 5 results for adjustment
  const recentResults = results.slice(0, 5);

  // Calculate average accuracy of recent results
  const avgAccuracy = recentResults.reduce((sum, result) => sum + result.accuracy, 0) / recentResults.length;

  // Calculate average score of recent results
  const avgScore = recentResults.reduce((sum, result) => sum + result.score, 0) / recentResults.length;

  // Determine if we should adjust difficulty
  let shouldAdjust = false;
  let adjustmentFactor = 0;

  // If average accuracy is 80% or higher and difficulty is below max
  if (avgAccuracy >= 80 && drill.difficulty < 0.9) {
    shouldAdjust = true;
    adjustmentFactor = 0.15; // Increase by 15%
  }
  // If average accuracy is below 60% and difficulty is above min
  else if (avgAccuracy < 60 && drill.difficulty > 0.1) {
    shouldAdjust = true;
    adjustmentFactor = -0.15; // Decrease by 15%
  }
  // If average score is significantly higher than best score
  else if (avgScore > (drill.bestScore || 0) * 1.2 && drill.difficulty < 0.9) {
    shouldAdjust = true;
    adjustmentFactor = 0.1; // Increase by 10%
  }

  // Calculate new difficulty
  let newDifficulty = drill.difficulty + adjustmentFactor;

  // Clamp between 0 and 1
  newDifficulty = Math.max(0, Math.min(1, newDifficulty));

  return {
    newDifficulty,
    shouldAdjust,
  };
};

export const shouldLevelUp = (results: DrillResult[]): boolean => {
  // Check if the last 3 results are all 80% or higher
  if (results.length < 3) return false;

  const lastThree = results.slice(0, 3);
  return lastThree.every(result => result.accuracy >= 80);
};
