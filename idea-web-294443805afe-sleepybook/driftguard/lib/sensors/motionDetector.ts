import { Accelerometer } from 'expo-sensors';

interface MotionData {
  magnitude: number;
  timestamp: number;
}

interface StillnessState {
  isStill: boolean;
  confidence: number;
  dataPoints: number;
  calibrating: boolean;
  secondsCollected: number;
  secondsNeeded: number;
}

class MotionTracker {
  private buffer: MotionData[] = [];
  private readonly BUFFER_SIZE = 1200; // 120 seconds at 10 samples/second
  private readonly REQUIRED_SECONDS = 120;
  private readonly SAMPLE_RATE = 100; // milliseconds
  private subscription: any = null;
  private isTracking = false;

  startMotionTracking() {
    if (this.isTracking) {
      return;
    }

    this.isTracking = true;
    this.buffer = [];

    this.subscription = Accelerometer.addListener(({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      const timestamp = Date.now();

      this.buffer.push({ magnitude, timestamp });

      // Keep only last 120 seconds of data
      if (this.buffer.length > this.BUFFER_SIZE) {
        this.buffer.shift();
      }
    });

    Accelerometer.setUpdateInterval(this.SAMPLE_RATE);
  }

  stopMotionTracking() {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
    this.isTracking = false;
    this.buffer = [];
  }

  getCurrentStillnessState(): StillnessState {
    const secondsCollected = this.buffer.length / 10; // 10 samples per second
    const calibrating = this.buffer.length < this.BUFFER_SIZE;

    if (this.buffer.length === 0) {
      return { 
        isStill: false, 
        confidence: 0, 
        dataPoints: 0,
        calibrating: true,
        secondsCollected: 0,
        secondsNeeded: this.REQUIRED_SECONDS
      };
    }

    // If we don't have enough data yet, return calibrating state
    if (calibrating) {
      return {
        isStill: false,
        confidence: 0,
        dataPoints: this.buffer.length,
        calibrating: true,
        secondsCollected: Math.floor(secondsCollected),
        secondsNeeded: this.REQUIRED_SECONDS
      };
    }

    // Calculate average magnitude over the full buffer
    const avgMagnitude = this.buffer.reduce((sum, data) => sum + data.magnitude, 0) / this.buffer.length;

    // Threshold for stillness
    const STILLNESS_THRESHOLD = 0.05;
    const isStill = avgMagnitude < STILLNESS_THRESHOLD;

    // Calculate confidence based on how far from threshold
    const confidence = isStill 
      ? Math.min(1, (STILLNESS_THRESHOLD - avgMagnitude) / STILLNESS_THRESHOLD)
      : Math.min(1, (avgMagnitude - STILLNESS_THRESHOLD) / STILLNESS_THRESHOLD);

    return {
      isStill,
      confidence,
      dataPoints: this.buffer.length,
      calibrating: false,
      secondsCollected: Math.floor(secondsCollected),
      secondsNeeded: this.REQUIRED_SECONDS
    };
  }

  getBufferStatus(): { size: number; maxSize: number; percentFull: number } {
    return {
      size: this.buffer.length,
      maxSize: this.BUFFER_SIZE,
      percentFull: (this.buffer.length / this.BUFFER_SIZE) * 100
    };
  }
}

// Export singleton instance
export const motionTracker = new MotionTracker();

// Legacy function for backward compatibility
export const detectStillness = async (duration = 120): Promise<boolean> => {
  return new Promise((resolve) => {
    let movementData: number[] = [];
    let subscription: any = null;

    const handleMotion = ({ x, y, z }: { x: number; y: number; z: number }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      movementData.push(magnitude);

      if (movementData.length >= duration * 10) {
        const avgMovement = movementData.reduce((sum, val) => sum + val, 0) / movementData.length;
        subscription.remove();
        resolve(avgMovement < 0.05);
      }
    };

    subscription = Accelerometer.addListener(handleMotion);
    Accelerometer.setUpdateInterval(100);
  });
};
