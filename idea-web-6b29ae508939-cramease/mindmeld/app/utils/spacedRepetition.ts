export const calculateNextReview = (lastReview: Date, recallStrength: number): Date => {
  const interval = Math.max(1, Math.round(1 / (1 - recallStrength)));
  const nextReview = new Date(lastReview);
  nextReview.setDate(lastReview.getDate() + interval);
  return nextReview;
};
