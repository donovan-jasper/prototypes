import { Accelerometer } from 'expo-sensors';
import { useSleepStore } from '../store/useSleepStore';
import { estimateSleepStage } from '../utils/sleepStageAlgorithm';

class SleepDetectionService {
  private subscription: any = null;
  private motionDataBuffer: number[] = [];
  private bufferSize: number = 30; // 30 seconds of data at 1Hz
  private updateInterval: number = 30000; // 30 seconds

  startDetection(): void {
    if (this.subscription) {
      return;
    }

    this.subscription = Accelerometer.addListener((data) => {
      // Calculate motion intensity (magnitude of acceleration)
      const motionIntensity = Math.sqrt(
        data.x * data.x + data.y * data.y + data.z * data.z
      );

      // Add to buffer
      this.motionDataBuffer.push(motionIntensity);

      // Keep buffer size limited
      if (this.motionDataBuffer.length > this.bufferSize) {
        this.motionDataBuffer.shift();
      }
    });

    // Set accelerometer update interval
    Accelerometer.setUpdateInterval(this.updateInterval);

    // Start periodic analysis
    this.analyzeMotionData();
  }

  stopDetection(): void {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
  }

  private analyzeMotionData(): void {
    if (this.motionDataBuffer.length >= this.bufferSize) {
      const sleepStage = estimateSleepStage(this.motionDataBuffer);
      useSleepStore.getState().setSleepStage(sleepStage);

      // Clear buffer for next analysis
      this.motionDataBuffer = [];
    }

    // Schedule next analysis
    setTimeout(() => this.analyzeMotionData(), this.updateInterval);
  }
}

export const sleepDetectionService = new SleepDetectionService();
