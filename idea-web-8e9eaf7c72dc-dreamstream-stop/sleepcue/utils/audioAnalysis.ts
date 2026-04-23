interface AudioAnalysisResult {
  isSleepPattern: boolean;
  confidence: number;
  averageAmplitude: number;
  standardDeviation: number;
  isLowAmplitude: boolean;
  isLowVariation: boolean;
}

interface MeteringReading {
  level: number;
  timestamp: number;
}

const METERING_HISTORY_SIZE = 20; // Increased from 10 for better analysis
const SLEEP_THRESHOLD_DB = -40;
const SLEEP_STDDEV_THRESHOLD = 5;
const SLEEP_DURATION_THRESHOLD = 3 * 60 * 1000; // 3 minutes in milliseconds
const LOW_AMPLITUDE_THRESHOLD = -50; // More sensitive threshold for low amplitude
const LOW_VARIATION_THRESHOLD = 3; // More sensitive threshold for low variation

let meteringHistory: MeteringReading[] = [];
let firstLowReadingTime: number | null = null;

export function analyzeMeteringLevel(meteringLevel: number): AudioAnalysisResult {
  const now = Date.now();

  // Add new reading to history
  meteringHistory.push({
    level: meteringLevel,
    timestamp: now,
  });

  // Keep only last METERING_HISTORY_SIZE readings
  if (meteringHistory.length > METERING_HISTORY_SIZE) {
    meteringHistory.shift();
  }

  // Need at least METERING_HISTORY_SIZE readings for analysis
  if (meteringHistory.length < METERING_HISTORY_SIZE) {
    return {
      isSleepPattern: false,
      confidence: 0,
      averageAmplitude: meteringLevel,
      standardDeviation: 0,
      isLowAmplitude: false,
      isLowVariation: false,
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
  const isLowAmplitude = averageAmplitude < LOW_AMPLITUDE_THRESHOLD;
  const isLowVariation = standardDeviation < LOW_VARIATION_THRESHOLD;

  // Track duration of consistent low pattern
  if (isLowAmplitude && isLowVariation) {
    if (firstLowReadingTime === null) {
      firstLowReadingTime = now;
    }

    const durationInPattern = now - firstLowReadingTime;
    const hasBeenLongEnough = durationInPattern >= SLEEP_DURATION_THRESHOLD;

    // Calculate confidence based on how long pattern has been consistent
    const durationFactor = Math.min(1, durationInPattern / SLEEP_DURATION_THRESHOLD);
    const amplitudeFactor = Math.min(1, Math.abs(averageAmplitude / LOW_AMPLITUDE_THRESHOLD));
    const variationFactor = Math.min(1, 1 - (standardDeviation / LOW_VARIATION_THRESHOLD));

    // Weight duration more heavily than amplitude/variation
    const confidence = (durationFactor * 0.6 + amplitudeFactor * 0.2 + variationFactor * 0.2);

    return {
      isSleepPattern: hasBeenLongEnough,
      confidence,
      averageAmplitude,
      standardDeviation,
      isLowAmplitude,
      isLowVariation,
    };
  } else {
    // Reset tracking if pattern breaks
    firstLowReadingTime = null;

    return {
      isSleepPattern: false,
      confidence: 0,
      averageAmplitude,
      standardDeviation,
      isLowAmplitude,
      isLowVariation,
    };
  }
}

export function resetMeteringHistory() {
  meteringHistory = [];
  firstLowReadingTime = null;
}

// Helper function to convert dB to linear scale for visualization
export function dbToLinear(db: number): number {
  return Math.pow(10, db / 20);
}

// Helper function to get the current metering history
export function getMeteringHistory(): MeteringReading[] {
  return [...meteringHistory];
}
