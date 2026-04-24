import { ReviewHistory } from './database';

export interface ReviewResult {
  nextReviewDate: Date;
  updatedHistory: ReviewHistory;
}

export const calculateNextReview = (
  currentDate: Date,
  recallStrength: number,
  lastReview?: ReviewHistory | null
): ReviewResult => {
  // Initialize SM-2 parameters
  let interval = 1; // Default interval in days
  let repetition = 0;
  let efactor = 2.5; // Starting E-Factor

  // If there was a previous review, use its values
  if (lastReview) {
    interval = lastReview.interval;
    repetition = lastReview.repetition;
    efactor = lastReview.efactor;
  }

  // Update E-Factor based on recall strength (0-1)
  // Quality ranges from 0 (complete blackout) to 5 (perfect response)
  // We'll map our recallStrength (0-1) to this quality scale
  const quality = Math.round(recallStrength * 5);

  // Update E-Factor
  efactor = Math.max(1.3, efactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // Update repetition and interval based on quality
  if (quality >= 3) {
    repetition += 1;

    if (repetition === 1) {
      interval = 1;
    } else if (repetition === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * efactor);
    }
  } else {
    repetition = 0;
    interval = 1;
  }

  // Calculate next review date
  const nextReviewDate = new Date(currentDate);
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return {
    nextReviewDate,
    updatedHistory: {
      interval,
      repetition,
      efactor
    }
  };
};
