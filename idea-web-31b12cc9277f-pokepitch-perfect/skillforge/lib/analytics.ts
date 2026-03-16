import { DrillResult, UserStats } from './types';
import { getUserStats } from './database';

export const calculateImprovement = async (): Promise<number> => {
  const stats = await getUserStats();
  if (stats.accuracyHistory.length < 2) {
    return 0;
  }
  const currentWeekAvg = stats.accuracyHistory.slice(-7).reduce((a, b) => a + b, 0) / 7;
  const previousWeekAvg = stats.accuracyHistory.slice(-14, -7).reduce((a, b) => a + b, 0) / 7;
  return (currentWeekAvg - previousWeekAvg) / previousWeekAvg * 100;
};

export const generateWeeklyReport = async (): Promise<string> => {
  const improvement = await calculateImprovement();
  const stats = await getUserStats();

  let report = `Weekly Improvement Report\n\n`;
  report += `Overall Improvement: ${improvement.toFixed(1)}%\n\n`;
  report += `Top Improvements:\n`;
  // Add more detailed analysis here
  report += `1. Accuracy: ${stats.accuracyHistory.slice(-1)[0]}%\n`;
  report += `2. Reaction Time: ${stats.reactionTimeHistory.slice(-1)[0]}ms\n`;
  report += `3. Consistency: ${stats.consistencyHistory.slice(-1)[0]}%\n\n`;
  report += `Recommendations:\n`;
  // Add personalized recommendations here

  return report;
};

export const getProgressData = async (): Promise<UserStats> => {
  return await getUserStats();
};
