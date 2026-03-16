import { Drill, DrillResult, Score } from './types';
import { initDatabase } from './database';

export const getDrills = async (): Promise<Drill[]> => {
  await initDatabase();
  // In a real app, you would fetch drills from the database
  return [
    {
      id: 'aim-training-1',
      name: 'Aim Training',
      description: 'Tap the targets as fast as you can',
      type: 'aim',
      difficulty: 'Beginner',
      duration: 30,
      bestScore: 0,
    },
    // Add more drills here
  ];
};

export const calculateScore = (targets: number[], userInputs: number[], timeLeft: number): Score => {
  const accuracy = (userInputs.filter((input, index) => input === targets[index]).length / targets.length) * 100;
  const reactionTime = timeLeft * 1000 / targets.length;
  const consistency = (1 - Math.abs(accuracy - 50) / 50) * 100;
  const total = accuracy * 0.5 + (100 - reactionTime) * 0.3 + consistency * 0.2;

  return {
    total: Math.round(total),
    accuracy: Math.round(accuracy),
    reactionTime: Math.round(reactionTime),
    consistency: Math.round(consistency),
  };
};

export const validateDrillCompletion = (targets: number[], userInputs: number[]): boolean => {
  return targets.length === userInputs.length && targets.every((target, index) => target === userInputs[index]);
};
