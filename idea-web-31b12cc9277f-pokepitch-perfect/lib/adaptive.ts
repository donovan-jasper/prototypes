import { Drill, DrillResult } from './types';

export const shouldLevelUp = (results: DrillResult[]): boolean => {
  // Check if the last 3 results are all 80%+ accuracy
  if (results.length < 3) return false;

  const lastThree = results.slice(0, 3);
  return lastThree.every(result => result.accuracy >= 80);
};

export const adjustDifficulty = (drill: Drill, results: DrillResult[]): Drill => {
  const levelUp = shouldLevelUp(results);

  let newDifficulty = drill.difficulty;
  let difficultyChange = 0;

  if (levelUp) {
    // Increase difficulty by 15% but cap at 1.0
    newDifficulty = Math.min(drill.difficulty * 1.15, 1.0);
    difficultyChange = Math.round((newDifficulty - drill.difficulty) * 100);
  } else if (results.length > 0) {
    // If the last result was below 50% accuracy, decrease difficulty by 10%
    const lastResult = results[0];
    if (lastResult.accuracy < 50) {
      newDifficulty = Math.max(drill.difficulty * 0.9, 0.1);
      difficultyChange = Math.round((newDifficulty - drill.difficulty) * 100);
    }
  }

  return {
    ...drill,
    difficulty: newDifficulty,
    difficultyChange: difficultyChange !== 0 ? difficultyChange : undefined,
  };
};

export const getRecommendedDrill = (drills: Drill[], userStats: UserStats): Drill => {
  // Find the drill with the lowest average accuracy
  const drillsWithStats = drills.map(drill => {
    const drillResults = userStats.accuracyHistory.filter((_, index) =>
      userStats.accuracyHistory[index] === drill.id
    );
    const avgAccuracy = drillResults.length > 0
      ? drillResults.reduce((sum, acc) => sum + acc, 0) / drillResults.length
      : 0;

    return {
      ...drill,
      avgAccuracy,
    };
  });

  // Sort by average accuracy (ascending) and pick the first one
  const sortedDrills = [...drillsWithStats].sort((a, b) => a.avgAccuracy - b.avgAccuracy);
  return sortedDrills[0];
};
