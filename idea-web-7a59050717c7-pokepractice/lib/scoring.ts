export interface ScoreResult {
  score: number;
  accuracy: number;
  speed: number;
}

export function calculateScore(params: {
  hits: number;
  total: number;
  timeMs: number;
}): ScoreResult {
  const accuracy = (params.hits / params.total) * 100;
  const speed = (params.hits / (params.timeMs / 1000)) * 10;

  // Weighted score calculation
  const score = Math.round(
    (accuracy * 0.6) + // 60% weight to accuracy
    (speed * 0.4)     // 40% weight to speed
  );

  return {
    score,
    accuracy: Math.round(accuracy),
    speed: Math.round(speed)
  };
}

export function getAccuracyRating(accuracy: number): string {
  if (accuracy >= 90) return 'Expert';
  if (accuracy >= 80) return 'Pro';
  if (accuracy >= 70) return 'Good';
  if (accuracy >= 60) return 'Fair';
  if (accuracy >= 50) return 'Poor';
  return 'Beginner';
}
