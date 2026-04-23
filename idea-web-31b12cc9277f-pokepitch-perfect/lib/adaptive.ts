import { Drill, DrillResult } from './types';

export function shouldLevelUp(results: DrillResult[]): boolean {
  // Check if user scored 80%+ on last 3 attempts
  if (results.length < 3) return false;

  const lastThree = results.slice(-3);
  return lastThree.every(result => result.score >= 80);
}

export function adjustDifficulty(drill: Drill, results: DrillResult[]): Drill {
  if (shouldLevelUp(results)) {
    // Increase difficulty by 15%
    return {
      ...drill,
      difficulty: Math.min(drill.difficulty + 0.15, 1.0), // Cap at 1.0
      duration: Math.max(drill.duration * 0.85, 5), // Decrease duration by 15% (minimum 5s)
    };
  }
  return drill;
}

export function getRecommendedDrill(drills: Drill[], results: DrillResult[]): Drill | null {
  if (results.length === 0) return null;

  // Find the drill with the lowest average score
  const drillScores: Record<string, { total: number; count: number }> = {};

  results.forEach(result => {
    if (!drillScores[result.drillId]) {
      drillScores[result.drillId] = { total: 0, count: 0 };
    }
    drillScores[result.drillId].total += result.score;
    drillScores[result.drillId].count += 1;
  });

  const drillAverages = Object.entries(drillScores).map(([drillId, { total, count }]) => ({
    drillId,
    average: total / count,
  }));

  if (drillAverages.length === 0) return null;

  const weakestDrillId = drillAverages.reduce((prev, current) =>
    prev.average < current.average ? prev : current
  ).drillId;

  return drills.find(drill => drill.id === weakestDrillId) || null;
}
