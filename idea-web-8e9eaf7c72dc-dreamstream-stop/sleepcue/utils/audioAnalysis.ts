interface AudioAnalysisResult {
  isSleepPattern: boolean;
  confidence: number;
  averageAmplitude: number;
  standardDeviation: number;
}

interface MeteringReading {
  level: number;
  timestamp: number;
}

const METERING_HISTORY_SIZE = 10;
const SLEEP_THRESHOLD_DB = -40;
const SLEEP_STDDEV_THRESHOLD = 5;
const SLEEP_DURATION_THRESHOLD = 3 * 60 * 1000; // 3 minutes in milliseconds

let meteringHistory: MeteringReading[] = [];
let firstLowReadingTime: number | null = null;

export function analyzeMeteringLevel(meteringLevel: number): AudioAnalysisResult {
  const now = Date.now();
  
  // Add new reading to history
  meteringHistory.push({
    level: meteringLevel,
    timestamp: now,
  });

  // Keep only last 10 readings
  if (meteringHistory.length > METERING_HISTORY_SIZE) {
    meteringHistory.shift();
  }

  // Need at least 10 readings for analysis
  if (meteringHistory.length < METERING_HISTORY_SIZE) {
    return {
      isSleepPattern: false,
      confidence: 0,
      averageAmplitude: meteringLevel,
      standardDeviation: 0,
    };
  }

  // Calculate average amplitude
  const sum = meteringHistory.reduce((acc, reading) => acc + reading.level, 0);
  const averageAmplitude = sum / meteringHistory.length;

  // Calculate standard deviation
  const squaredDiffs = meteringHistory.map(reading => {
    const diff = reading.level - averageAmplitude;
    return diff * diff;
  });
  const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / squaredDiffs.length;
  const standardDeviation = Math.sqrt(variance);

  // Check if current pattern indicates sleep
  const isLowAmplitude = averageAmplitude < SLEEP_THRESHOLD_DB;
  const isLowVariation = standardDeviation < SLEEP_STDDEV_THRESHOLD;

  // Track duration of consistent low pattern
  if (isLowAmplitude && isLowVariation) {
    if (firstLowReadingTime === null) {
      firstLowReadingTime = now;
    }
    
    const durationInPattern = now - firstLowReadingTime;
    const hasBeenLongEnough = durationInPattern >= SLEEP_DURATION_THRESHOLD;

    // Calculate confidence based on how long pattern has been consistent
    const durationFactor = Math.min(1, durationInPattern / SLEEP_DURATION_THRESHOLD);
    const amplitudeFactor = Math.min(1, Math.abs(averageAmplitude / SLEEP_THRESHOLD_DB));
    const variationFactor = Math.min(1, 1 - (standardDeviation / SLEEP_STDDEV_THRESHOLD));
    
    const confidence = (durationFactor * 0.5 + amplitudeFactor * 0.25 + variationFactor * 0.25);

    return {
      isSleepPattern: hasBeenLongEnough,
      confidence,
      averageAmplitude,
      standardDeviation,
    };
  } else {
    // Reset tracking if pattern breaks
    firstLowReadingTime = null;
    
    return {
      isSleepPattern: false,
      confidence: 0,
      averageAmplitude,
      standardDeviation,
    };
  }
}

export function resetMeteringHistory() {
  meteringHistory = [];
  firstLowReadingTime = null;
}

// Legacy function for backward compatibility - now deprecated
export function analyzeAudio(data: Float32Array[]): AudioAnalysisResult {
  console.warn('analyzeAudio is deprecated. Use analyzeMeteringLevel instead.');
  return {
    isSleepPattern: false,
    confidence: 0,
    averageAmplitude: 0,
    standardDeviation: 0,
  };
}
