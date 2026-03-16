import { ProgressUnit } from '../types';

export const calculateProgress = (current: number, total: number, unit: ProgressUnit): number => {
  if (unit === 'percentage') {
    return current;
  }
  return (current / total) * 100;
};

export const convertProgress = (
  current: number,
  total: number,
  fromUnit: ProgressUnit,
  toUnit: ProgressUnit,
  newTotal: number
): number => {
  const percentage = calculateProgress(current, total, fromUnit);
  if (toUnit === 'percentage') {
    return percentage;
  }
  return (percentage / 100) * newTotal;
};

export const estimateTimeRemaining = (current: number, total: number, unit: ProgressUnit): number => {
  const percentage = calculateProgress(current, total, unit);
  return total - current;
};

export const formatProgressDisplay = (progress: number, unit: ProgressUnit): string => {
  if (unit === 'percentage') {
    return `${Math.round(progress)}%`;
  }
  return `${Math.round(progress)} ${unit}`;
};
