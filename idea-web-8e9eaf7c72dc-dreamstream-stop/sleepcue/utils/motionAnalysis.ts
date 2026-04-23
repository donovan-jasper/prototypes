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
  stillnessDuration: number;
}

const STILLNESS_THRESHOLD = 0.05; // m/s²
const STILLNESS_DURATION_THRESHOLD = 3 * 60 * 1000; // 3 minutes
const MOVEMENT_SPIKE_THRESHOLD = 0.5; // m/s²

export function analyzeMotion(data: MotionData[], lastMotionTime: number): MotionAnalysisResult {
  if (data.length === 0) {
    return {
      isStill: false,
      confidence: 0,
      averageMagnitude: 0,
      standardDeviation: 0,
      stillnessDuration: 0
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

  // Calculate stillness duration
  const now = Date.now();
  const stillnessDuration = now - lastMotionTime;

  // Determine if motion is still (low average magnitude and low standard deviation)
  const isStill = averageMagnitude < STILLNESS_THRESHOLD &&
                  standardDeviation < STILLNESS_THRESHOLD / 2 &&
                  stillnessDuration >= STILLNESS_DURATION_THRESHOLD;

  // Calculate confidence (0-1 scale)
  // Lower average and stdDev = higher confidence
  // Cap at 0.9 to account for false positives
  const confidence = Math.min(0.9, Math.max(0, 1 - (averageMagnitude * 5 + standardDeviation * 2)));

  return {
    isStill,
    confidence,
    averageMagnitude,
    standardDeviation,
    stillnessDuration
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

// Helper function to detect movement spikes
export function detectMovementSpike(data: MotionData[]): boolean {
  if (data.length < 2) return false;

  const magnitudes = data.map(point => {
    return Math.sqrt(point.x * point.x + point.y * point.y + point.z * point.z);
  });

  // Check if any magnitude exceeds the spike threshold
  return magnitudes.some(magnitude => magnitude > MOVEMENT_SPIKE_THRESHOLD);
}
