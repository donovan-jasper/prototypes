interface MotionData {
  x: number;
  y: number;
  z: number;
}

interface MotionAnalysisResult {
  isStill: boolean;
  confidence: number;
  averageMagnitude: number;
  standardDeviation: number;
}

export function analyzeMotion(data: MotionData[]): MotionAnalysisResult {
  if (data.length === 0) {
    return {
      isStill: false,
      confidence: 0,
      averageMagnitude: 0,
      standardDeviation: 0
    };
  }

  // Calculate magnitude of movement for each data point
  const magnitudes = data.map(point => {
    return Math.sqrt(point.x * point.x + point.y * point.y + point.z * point.z);
  });

  // Calculate average magnitude
  const sum = magnitudes.reduce((acc, val) => acc + val, 0);
  const averageMagnitude = sum / magnitudes.length;

  // Calculate standard deviation
  const squaredDiffs = magnitudes.map(val => {
    const diff = val - averageMagnitude;
    return diff * diff;
  });
  const avgSquaredDiff = squaredDiffs.reduce((acc, val) => acc + val, 0) / squaredDiffs.length;
  const standardDeviation = Math.sqrt(avgSquaredDiff);

  // Determine if motion is still (low average magnitude and low standard deviation)
  const isStill = averageMagnitude < 0.05 && standardDeviation < 0.02;

  // Calculate confidence (0-1 scale)
  // Lower average and stdDev = higher confidence
  // Cap at 0.9 to account for false positives
  const confidence = Math.min(0.9, Math.max(0, 1 - (averageMagnitude * 5 + standardDeviation * 2)));

  return {
    isStill,
    confidence,
    averageMagnitude,
    standardDeviation,
  };
}

// Helper function to smooth motion data
export function smoothMotionData(data: MotionData[], windowSize: number = 5): MotionData[] {
  if (data.length <= windowSize) return [...data];

  const smoothedData: MotionData[] = [];

  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(data.length - 1, i + Math.floor(windowSize / 2));

    let sumX = 0, sumY = 0, sumZ = 0;
    let count = 0;

    for (let j = start; j <= end; j++) {
      sumX += data[j].x;
      sumY += data[j].y;
      sumZ += data[j].z;
      count++;
    }

    smoothedData.push({
      x: sumX / count,
      y: sumY / count,
      z: sumZ / count,
    });
  }

  return smoothedData;
}
