export interface ReviewHistory {
  interval: number;
  repetition: number;
  efactor: number;
}

export const calculateNextReview = (
  lastReview: Date,
  recallStrength: number,
  history: ReviewHistory = { interval: 1, repetition: 0, efactor: 2.5 }
): { nextReviewDate: Date; updatedHistory: ReviewHistory } => {
  // SM-2 algorithm implementation
  const quality = Math.min(5, Math.max(0, Math.round(recallStrength * 5)));

  // Update efactor
  let newEfactor = history.efactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  newEfactor = Math.max(1.3, newEfactor);

  // Update repetition
  let newRepetition = quality >= 3 ? history.repetition + 1 : 0;

  // Calculate interval
  let newInterval: number;
  if (newRepetition === 1) {
    newInterval = 1;
  } else if (newRepetition === 2) {
    newInterval = 6;
  } else {
    newInterval = Math.round(history.interval * newEfactor);
  }

  // Calculate next review date
  const nextReviewDate = new Date(lastReview);
  nextReviewDate.setDate(lastReview.getDate() + newInterval);

  return {
    nextReviewDate,
    updatedHistory: {
      interval: newInterval,
      repetition: newRepetition,
      efactor: newEfactor
    }
  };
};
