import { format, parseISO, differenceInDays, addDays, subDays } from 'date-fns';

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

export const calculateAverageLutealPhase = (cycles: Cycle[]): number => {
  if (cycles.length < 2) {
    return 14; // Default luteal phase length
  }

  const lutealLengths = [];
  for (let i = 0; i < cycles.length; i++) {
    const cycle = cycles[i];
    if (cycle.startDate && cycle.endDate) {
      const start = parseISO(cycle.startDate);
      const end = parseISO(cycle.endDate);
      const cycleLength = differenceInDays(end, start);

      // Luteal phase is typically 11-16 days, but we'll calculate it as cycle length - 14
      // (assuming follicular phase is ~14 days)
      const lutealLength = cycleLength - 14;
      if (lutealLength > 0 && lutealLength < 20) { // Reasonable range for luteal phase
        lutealLengths.push(lutealLength);
      }
    }
  }

  if (lutealLengths.length === 0) {
    return 14;
  }

  return Math.round(
    lutealLengths.reduce((sum, length) => sum + length, 0) / lutealLengths.length
  );
};

export const calculateOvulationDate = (cycles: Cycle[], currentCycleStart: string): Date | null => {
  if (cycles.length === 0 || !currentCycleStart) {
    return null;
  }

  const avgLutealPhase = calculateAverageLutealPhase(cycles);
  const cycleStartDate = parseISO(currentCycleStart);

  // Ovulation typically occurs 14 days before the next period
  // So we subtract the luteal phase length from the average cycle length
  const ovulationDate = subDays(cycleStartDate, avgLutealPhase);

  return ovulationDate;
};

export const predictNextPeriodWithOvulation = (cycles: Cycle[]): { predictedStart: Date | null; ovulationDate: Date | null } => {
  const predictedStart = predictNextPeriod(cycles);

  if (!predictedStart || cycles.length === 0) {
    return {
      predictedStart: null,
      ovulationDate: null
    };
  }

  const ovulationDate = calculateOvulationDate(cycles, predictedStart.toISOString());

  return {
    predictedStart,
    ovulationDate
  };
};
