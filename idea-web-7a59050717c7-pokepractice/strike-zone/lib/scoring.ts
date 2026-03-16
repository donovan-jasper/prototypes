export const calculateScore = ({ hits, total, timeMs }) => {
  const accuracy = (hits / total) * 100;
  const speed = (hits / timeMs) * 1000;
  const score = Math.round(accuracy * speed);
  return { score, accuracy };
};

export const getAccuracyRating = (percentage) => {
  if (percentage >= 90) return 'Expert';
  if (percentage >= 75) return 'Good';
  if (percentage >= 50) return 'Fair';
  return 'Poor';
};
