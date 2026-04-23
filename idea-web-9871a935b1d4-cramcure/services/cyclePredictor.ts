import { format, parseISO, differenceInDays, addDays } from 'date-fns';

interface Cycle {
  startDate: string;
  endDate?: string;
  predictedEndDate?: string;
}

export const predictNextPeriod = (cycles: Cycle[]): Date | null => {
  if (cycles.length < 2) {
    return null; // Not enough data to predict
  }

  // Calculate average cycle length
  const cycleLengths = [];
  for (let i = 1; i < cycles.length; i++) {
    const prevCycle = cycles[i - 1];
    const currentCycle = cycles[i];

    if (prevCycle.endDate && currentCycle.startDate) {
      const prevEnd = parseISO(prevCycle.endDate);
      const currentStart = parseISO(currentCycle.startDate);
      const length = differenceInDays(currentStart, prevEnd);
      cycleLengths.push(length);
    }
  }

  if (cycleLengths.length === 0) {
    return null;
  }

  const avgCycleLength = Math.round(
    cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length
  );

  // Use the most recent cycle to predict next period
  const lastCycle = cycles[0];
  if (!lastCycle.startDate) {
    return null;
  }

  const lastStartDate = parseISO(lastCycle.startDate);
  const predictedStartDate = addDays(lastStartDate, avgCycleLength);

  return predictedStartDate;
};

export const calculateCycleLength = (cycles: Cycle[]): number => {
  if (cycles.length < 2) {
    return 28; // Default average cycle length
  }

  const cycleLengths = [];
  for (let i = 1; i < cycles.length; i++) {
    const prevCycle = cycles[i - 1];
    const currentCycle = cycles[i];

    if (prevCycle.endDate && currentCycle.startDate) {
      const prevEnd = parseISO(prevCycle.endDate);
      const currentStart = parseISO(currentCycle.startDate);
      const length = differenceInDays(currentStart, prevEnd);
      cycleLengths.push(length);
    }
  }

  if (cycleLengths.length === 0) {
    return 28;
  }

  return Math.round(
    cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length
  );
};

export const identifyPatterns = (cycles: Cycle[]): { isIrregular: boolean; averageLength: number } => {
  const avgLength = calculateCycleLength(cycles);

  // Consider cycles irregular if they vary by more than 7 days from average
  const isIrregular = cycles.some(cycle => {
    if (!cycle.startDate || !cycle.endDate) return false;
    const start = parseISO(cycle.startDate);
    const end = parseISO(cycle.endDate);
    const length = differenceInDays(end, start);
    return Math.abs(length - avgLength) > 7;
  });

  return {
    isIrregular,
    averageLength: avgLength,
  };
};
