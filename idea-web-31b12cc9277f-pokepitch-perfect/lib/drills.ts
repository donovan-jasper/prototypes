import { Drill, DrillResult, Score } from './types';
import { initDatabase } from './database';
import { DRILLS } from '../constants/Drills';

export const getDrills = async (): Promise<Drill[]> => {
  await initDatabase();
  return DRILLS;
};

export interface Target {
  id: string;
  x: number;
  y: number;
  timestamp: number;
}

export const generateAimTargets = (
  count: number,
  screenDimensions: { width: number; height: number }
): Target[] => {
  const targets: Target[] = [];
  const targetSize = 60;
  const padding = 40;

  for (let i = 0; i < count; i++) {
    const x = Math.random() * (screenDimensions.width - targetSize - padding * 2) + padding;
    const y = Math.random() * (screenDimensions.height - targetSize - padding * 2) + padding;
    
    targets.push({
      id: `target-${i}-${Date.now()}`,
      x,
      y,
      timestamp: Date.now(),
    });
  }

  return targets;
};

export interface UserInput {
  targetId: string | null;
  timestamp: number;
  isHit: boolean;
  reactionTime?: number;
}

export const calculateScore = (targets: Target[], userInputs: UserInput[], timeLeft: number): Score => {
  const hits = userInputs.filter(input => input.isHit);
  const misses = userInputs.filter(input => !input.isHit);
  
  const accuracy = targets.length > 0 ? (hits.length / targets.length) * 100 : 0;
  
  const avgReactionTime = hits.length > 0
    ? hits.reduce((sum, input) => sum + (input.reactionTime || 0), 0) / hits.length
    : 0;
  
  const reactionTimeScore = Math.max(0, 100 - avgReactionTime / 10);
  
  const consistency = hits.length > 0
    ? 100 - (Math.abs(accuracy - 100) / 100) * 100
    : 0;
  
  const total = accuracy * 0.5 + reactionTimeScore * 0.3 + consistency * 0.2;

  return {
    total: Math.round(total),
    accuracy: Math.round(accuracy),
    reactionTime: Math.round(avgReactionTime),
    consistency: Math.round(consistency),
  };
};

export const validateDrillCompletion = (targets: number[], userInputs: number[]): boolean => {
  return targets.length === userInputs.length && targets.every((target, index) => target === userInputs[index]);
};
