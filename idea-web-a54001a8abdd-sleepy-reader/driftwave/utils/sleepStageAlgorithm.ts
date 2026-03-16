export function estimateSleepStage(motionData: number[]): string {
  // Calculate average motion intensity
  const sum = motionData.reduce((a, b) => a + b, 0);
  const average = sum / motionData.length;

  // Define thresholds for sleep stages
  const awakeThreshold = 0.5;
  const lightThreshold = 0.2;

  // Determine sleep stage based on motion intensity
  if (average > awakeThreshold) {
    return 'awake';
  } else if (average > lightThreshold) {
    return 'light';
  } else {
    return 'deep';
  }
}

export function analyzeMotionData(motionData: number[]): {
  average: number;
  min: number;
  max: number;
  variance: number;
} {
  const sum = motionData.reduce((a, b) => a + b, 0);
  const average = sum / motionData.length;
  const min = Math.min(...motionData);
  const max = Math.max(...motionData);

  // Calculate variance
  const squaredDiffs = motionData.map((value) => {
    const diff = value - average;
    return diff * diff;
  });
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / motionData.length;

  return { average, min, max, variance };
}
