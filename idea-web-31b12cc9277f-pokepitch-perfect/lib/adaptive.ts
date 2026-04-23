import { Drill, DrillResult } from './types';

export const shouldLevelUp = (consecutiveSuccesses: number): boolean => {
  return consecutiveSuccesses >= 3;
};

export const adjustDifficulty = (currentDrill: Drill, allResults: DrillResult[]): { newDifficulty: number; shouldAdjust: boolean } => {
  // If we don't have enough data, don't adjust
  if (allResults.length < 3) {
    return { newDifficulty: currentDrill.difficulty, shouldAdjust: false };
  }

  // Get the last 3 results
  const recentResults = allResults.slice(0, 3);

  // Check if all recent results were successful (80%+ accuracy)
  const allSuccessful = recentResults.every(result => result.accuracy >= 80);

  if (allSuccessful) {
    // Increase difficulty by 15%
    const newDifficulty = Math.min(5, currentDrill.difficulty * 1.15);
    return { newDifficulty, shouldAdjust: true };
  }

  // If not all successful, check if we should decrease difficulty
  const avgAccuracy = recentResults.reduce((sum, result) => sum + result.accuracy, 0) / recentResults.length;

  if (avgAccuracy < 60) {
    // Decrease difficulty by 10%
    const newDifficulty = Math.max(0.5, currentDrill.difficulty * 0.9);
    return { newDifficulty, shouldAdjust: true };
  }

  // No adjustment needed
  return { newDifficulty: currentDrill.difficulty, shouldAdjust: false };
};

export const getRecommendedDrill = (drills: Drill[], userStats: any): Drill => {
  // Find the drill with the lowest average score
  const drillScores: { [key: string]: number } = {};

  // Calculate average score for each drill
  drills.forEach(drill => {
    const results = userStats.drillResults.filter((r: any) => r.drillId === drill.id);
    if (results.length > 0) {
      const avgScore = results.reduce((sum: number, r: any) => sum + r.score, 0) / results.length;
      drillScores[drill.id] = avgScore;
    } else {
      drillScores[drill.id] = 0;
    }
  });

  // Find the drill with the lowest average score
  const worstDrillId = Object.keys(drillScores).reduce((a, b) =>
    drillScores[a] < drillScores[b] ? a : b
  );

  return drills.find(d => d.id === worstDrillId) || drills[0];
};
