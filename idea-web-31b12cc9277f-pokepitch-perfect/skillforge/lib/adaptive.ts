import { Drill, DrillResult } from './types';

export const shouldLevelUp = (results: DrillResult[]): boolean => {
  if (results.length < 3) {
    return false;
  }
  const lastThree = results.slice(-3);
  return lastThree.every((result) => result.score.total >= 80);
};

export const adjustDifficulty = (drill: Drill, levelUp: boolean): Drill => {
  const newDifficulty = levelUp ? drill.difficulty + 1 : drill.difficulty - 1;
  return {
    ...drill,
    difficulty: newDifficulty,
    duration: levelUp ? drill.duration * 0.85 : drill.duration * 1.15,
  };
};

export const getRecommendedDrill = (drills: Drill[], weakAreas: string[]): Drill => {
  const weakDrills = drills.filter((drill) => weakAreas.includes(drill.type));
  return weakDrills[Math.floor(Math.random() * weakDrills.length)];
};
