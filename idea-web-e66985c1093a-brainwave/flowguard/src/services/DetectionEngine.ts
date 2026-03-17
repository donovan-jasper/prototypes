import { SensorData } from '../types';

type DrowsinessState = 'normal' | 'drowsy' | 'alert';

export class DetectionEngine {
  private profileId: string;
  private sensitivity: number;
  private stillnessThreshold: number;
  private stillnessDuration: number;
  private stillnessStartTime: number | null = null;
  private drowsinessState: DrowsinessState = 'normal';
  private dataBuffer: SensorData[] = [];
  private bufferSize: number = 30; // Store last 30 readings (3 seconds at 100ms interval)
  private movementVarianceHistory: number[] = [];
  private varianceHistorySize: number = 60; // Store last 60 variance readings (6 seconds)
  private lastMovementTime: number = Date.now();
  private movementThreshold: number = 0.5; // Threshold for detecting movement

  constructor(profileId: string, sensitivity: number = 5) {
    this.profileId = profileId;
    this.sensitivity = sensitivity;
    this.stillnessThreshold = this.calculateThreshold();
    this.stillnessDuration = this.calculateDuration();
  }

  private calculateThreshold(): number {
    // Adjust threshold based on profile and sensitivity
    const baseThreshold = 0.1; // Base threshold for stillness
    const profileMultiplier = this.getProfileMultiplier();
    return baseThreshold * (1 + (this.sensitivity - 5) * 0.1) * profileMultiplier;
  }

  private calculateDuration(): number {
    // Adjust required stillness duration based on profile and sensitivity
    const baseDuration = 3000; // 3 seconds
    const profileMultiplier = this.getProfileMultiplier();
    return baseDuration * (1 + (this.sensitivity - 5) * 0.1) * profileMultiplier;
  }

  private getProfileMultiplier(): number {
    // Different profiles may have different sensitivity requirements
    const profileMultipliers: Record<string, number> = {
      study: 1.0,
      work: 0.9,
      audiobook: 1.1,
      meditation: 0.8,
      driving: 1.3, // Higher sensitivity for driving
    };
    return profileMultipliers[this.profileId] || 1.0;
  }

  processSensorData(data: SensorData): void {
    // Add new data to buffer
    this.dataBuffer.push(data);
    if (this.dataBuffer.length > this.bufferSize) {
      this.dataBuffer.shift();
    }

    // Calculate movement variance
    const variance = this.calculateMovementVariance();

    // Update movement variance history
    this.movementVarianceHistory.push(variance);
    if (this.movementVarianceHistory.length > this.varianceHistorySize) {
      this.movementVarianceHistory.shift();
    }

    // Check for significant movement
    if (variance > this.movementThreshold) {
      this.lastMovementTime = Date.now();
    }

    // Update drowsiness state
    this.updateDrowsinessState();
  }

  private calculateMovementVariance(): number {
    if (this.dataBuffer.length < this.bufferSize) {
      return 0;
    }

    // Calculate mean of each axis
    const meanX = this.dataBuffer.reduce((sum, data) => sum + data.x, 0) / this.bufferSize;
    const meanY = this.dataBuffer.reduce((sum, data) => sum + data.y, 0) / this.bufferSize;
    const meanZ = this.dataBuffer.reduce((sum, data) => sum + data.z, 0) / this.bufferSize;

    // Calculate variance of each axis
    const varianceX = this.dataBuffer.reduce((sum, data) => sum + Math.pow(data.x - meanX, 2), 0) / this.bufferSize;
    const varianceY = this.dataBuffer.reduce((sum, data) => sum + Math.pow(data.y - meanY, 2), 0) / this.bufferSize;
    const varianceZ = this.dataBuffer.reduce((sum, data) => sum + Math.pow(data.z - meanZ, 2), 0) / this.bufferSize;

    // Return the maximum variance across all axes
    return Math.max(varianceX, varianceY, varianceZ);
  }

  private updateDrowsinessState(): void {
    const currentTime = Date.now();
    const timeSinceLastMovement = currentTime - this.lastMovementTime;

    // Check for stillness
    if (timeSinceLastMovement >= this.stillnessDuration) {
      // Check if recent movement variance is below threshold
      const recentVariance = this.movementVarianceHistory.slice(-10); // Last 1 second of data
      const avgVariance = recentVariance.reduce((sum, v) => sum + v, 0) / recentVariance.length;

      if (avgVariance < this.stillnessThreshold) {
        // Check for subtle head movements (nods)
        if (this.detectSubtleHeadMovements()) {
          this.drowsinessState = 'drowsy';
        } else {
          this.drowsinessState = 'alert';
        }
      } else {
        this.drowsinessState = 'normal';
      }
    } else {
      this.drowsinessState = 'normal';
    }
  }

  private detectSubtleHeadMovements(): boolean {
    // Analyze the movement pattern for subtle nods
    // This is a simplified version - a real implementation would use more sophisticated pattern recognition

    // Check if there are any significant peaks in the movement variance history
    // that could indicate subtle head movements
    const peakThreshold = this.stillnessThreshold * 2;
    const recentVariance = this.movementVarianceHistory.slice(-30); // Last 3 seconds of data

    // Find peaks in the variance data
    let peakCount = 0;
    for (let i = 1; i < recentVariance.length - 1; i++) {
      if (recentVariance[i] > peakThreshold &&
          recentVariance[i] > recentVariance[i-1] &&
          recentVariance[i] > recentVariance[i+1]) {
        peakCount++;
      }
    }

    // If we have multiple small peaks, it might indicate subtle head movements
    return peakCount >= 2;
  }

  isDrowsy(): boolean {
    return this.drowsinessState === 'drowsy' || this.drowsinessState === 'alert';
  }

  getDrowsinessState(): DrowsinessState {
    return this.drowsinessState;
  }

  getSensitivity(): number {
    return this.sensitivity;
  }

  setSensitivity(sensitivity: number): void {
    this.sensitivity = sensitivity;
    this.stillnessThreshold = this.calculateThreshold();
    this.stillnessDuration = this.calculateDuration();
  }

  getMovementVariance(): number {
    if (this.movementVarianceHistory.length === 0) return 0;
    return this.movementVarianceHistory[this.movementVarianceHistory.length - 1];
  }
}
