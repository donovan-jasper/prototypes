import { AccelerometerData } from 'expo-sensors';

export const detectPosture = (data: AccelerometerData): { isCorrect: boolean; angle: number } => {
  const { x, y, z } = data;
  const angle = Math.atan2(x, Math.sqrt(y * y + z * z)) * (180 / Math.PI);
  const isCorrect = angle > -10 && angle < 10;
  return { isCorrect, angle };
};

export const isHoldingCorrectly = (currentDuration: number, requiredDuration: number): boolean => {
  return currentDuration >= requiredDuration;
};
