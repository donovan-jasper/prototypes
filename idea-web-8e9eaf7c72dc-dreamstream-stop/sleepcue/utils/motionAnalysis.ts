interface MotionData {
  x: number;
  y: number;
  z: number;
}

interface MotionAnalysisResult {
  isStill: boolean;
  confidence: number;
}

export function analyzeMotion(data: MotionData[]): MotionAnalysisResult {
  if (data.length === 0) {
    return { isStill: false, confidence: 0 };
  }

  // Calculate magnitude of movement for each data point
  const magnitudes = data.map(point => {
    return Math.sqrt(point.x * point.x + point.y * point.y + point.z * point.z);
  });

  // Calculate average magnitude
  const sum = magnitudes.reduce((acc, val) => acc + val, 0);
  const average = sum / magnitudes.length;

  // Calculate standard deviation
  const squaredDiffs = magnitudes.map(val => {
    const diff = val - average;
    return diff * diff;
  });
  const avgSquaredDiff = squaredDiffs.reduce((acc, val) => acc + val, 0) / squaredDiffs.length;
  const stdDev = Math.sqrt(avgSquaredDiff);

  // Determine if motion is still (low average magnitude and low standard deviation)
  const isStill = average < 0.05 && stdDev < 0.02;

  // Calculate confidence (0-1 scale)
  // Lower average and stdDev = higher confidence
  const confidence = Math.min(1, Math.max(0, 1 - (average * 5 + stdDev * 2)));

  return {
    isStill,
    confidence,
  };
}
