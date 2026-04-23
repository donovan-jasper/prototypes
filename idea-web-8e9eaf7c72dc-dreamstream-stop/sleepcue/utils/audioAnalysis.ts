interface AudioAnalysisResult {
  isSleepPattern: boolean;
  confidence: number;
  averageAmplitude: number;
  standardDeviation: number;
  isLowAmplitude: boolean;
  isLowVariation: boolean;
  dominantFrequency: number;
}

interface MeteringReading {
  level: number;
  timestamp: number;
}

const METERING_HISTORY_SIZE = 30; // Increased for better analysis
const LOW_AMPLITUDE_THRESHOLD = -50; // dB
const LOW_VARIATION_THRESHOLD = 3; // dB
const SLEEP_DURATION_THRESHOLD = 3 * 60 * 1000; // 3 minutes
const BREATHING_FREQUENCY_RANGE = [2, 6]; // Hz (typical breathing range)

let meteringHistory: MeteringReading[] = [];
let firstLowReadingTime: number | null = null;
let dominantFrequencyHistory: number[] = [];

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
      dominantFrequency: 0,
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

  // Estimate dominant frequency (simplified approach)
  const dominantFrequency = estimateDominantFrequency(meteringHistory);

  // Check if dominant frequency is in breathing range
  const isBreathingFrequency = dominantFrequency >= BREATHING_FREQUENCY_RANGE[0] &&
                              dominantFrequency <= BREATHING_FREQUENCY_RANGE[1];

  // Track duration of consistent low pattern
  if (isLowAmplitude && isLowVariation && isBreathingFrequency) {
    if (firstLowReadingTime === null) {
      firstLowReadingTime = now;
    }

    const durationInPattern = now - firstLowReadingTime;
    const hasBeenLongEnough = durationInPattern >= SLEEP_DURATION_THRESHOLD;

    // Calculate confidence based on how long pattern has been consistent
    const durationFactor = Math.min(1, durationInPattern / SLEEP_DURATION_THRESHOLD);
    const amplitudeFactor = Math.min(1, Math.abs(averageAmplitude / LOW_AMPLITUDE_THRESHOLD));
    const variationFactor = Math.min(1, 1 - (standardDeviation / LOW_VARIATION_THRESHOLD));
    const frequencyFactor = isBreathingFrequency ? 0.5 : 0;

    // Weight duration more heavily than amplitude/variation
    const confidence = (durationFactor * 0.5 + amplitudeFactor * 0.2 + variationFactor * 0.2 + frequencyFactor);

    return {
      isSleepPattern: hasBeenLongEnough,
      confidence,
      averageAmplitude,
      standardDeviation,
      isLowAmplitude,
      isLowVariation,
      dominantFrequency,
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
      dominantFrequency,
    };
  }
}

export function resetMeteringHistory() {
  meteringHistory = [];
  firstLowReadingTime = null;
  dominantFrequencyHistory = [];
}

// Helper function to estimate dominant frequency (simplified approach)
function estimateDominantFrequency(readings: MeteringReading[]): number {
  if (readings.length < 2) return 0;

  // Calculate time differences between readings
  const timeDiffs: number[] = [];
  for (let i = 1; i < readings.length; i++) {
    timeDiffs.push(readings[i].timestamp - readings[i-1].timestamp);
  }

  // Calculate average time difference (sampling period)
  const avgTimeDiff = timeDiffs.reduce((acc, val) => acc + val, 0) / timeDiffs.length;

  // Calculate frequency based on sampling period
  const frequency = 1000 / avgTimeDiff; // Convert to Hz

  // Store in history for more accurate estimation
  dominantFrequencyHistory.push(frequency);
  if (dominantFrequencyHistory.length > 10) {
    dominantFrequencyHistory.shift();
  }

  // Return average of last few frequencies
  const sum = dominantFrequencyHistory.reduce((acc, val) => acc + val, 0);
  return sum / dominantFrequencyHistory.length;
}

// Helper function to convert dB to linear scale for visualization
export function dbToLinear(db: number): number {
  return Math.pow(10, db / 20);
}

// Helper function to get the current metering history
export function getMeteringHistory(): MeteringReading[] {
  return [...meteringHistory];
}
