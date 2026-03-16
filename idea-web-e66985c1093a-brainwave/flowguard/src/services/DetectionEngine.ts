import { SensorData } from '../types';

export class DetectionEngine {
  private profileId: string;
  private sensitivity: number;
  private stillnessThreshold: number;
  private stillnessDuration: number;
  private stillnessStartTime: number | null = null;
  private isDrowsyState: boolean = false;
  private dataBuffer: SensorData[] = [];
  private bufferSize: number = 30; // Store last 30 readings (3 seconds at 100ms interval)

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

    // Check for stillness
    if (this.isStill()) {
      if (this.stillnessStartTime === null) {
        this.stillnessStartTime = Date.now();
      } else if (Date.now() - this.stillnessStartTime >= this.stillnessDuration) {
        this.isDrowsyState = true;
      }
    } else {
      this.stillnessStartTime = null;
      this.isDrowsyState = false;
    }
  }

  private isStill(): boolean {
    if (this.dataBuffer.length < this.bufferSize) {
      return false;
    }

    // Calculate variance of the last 30 readings
    const meanX = this.dataBuffer.reduce((sum, data) => sum + data.x, 0) / this.bufferSize;
    const meanY = this.dataBuffer.reduce((sum, data) => sum + data.y, 0) / this.bufferSize;
    const meanZ = this.dataBuffer.reduce((sum, data) => sum + data.z, 0) / this.bufferSize;

    const varianceX = this.dataBuffer.reduce((sum, data) => sum + Math.pow(data.x - meanX, 2), 0) / this.bufferSize;
    const varianceY = this.dataBuffer.reduce((sum, data) => sum + Math.pow(data.y - meanY, 2), 0) / this.bufferSize;
    const varianceZ = this.dataBuffer.reduce((sum, data) => sum + Math.pow(data.z - meanZ, 2), 0) / this.bufferSize;

    // Check if all axes are below threshold
    return varianceX < this.stillnessThreshold &&
           varianceY < this.stillnessThreshold &&
           varianceZ < this.stillnessThreshold;
  }

  isDrowsy(): boolean {
    return this.isDrowsyState;
  }

  getSensitivity(): number {
    return this.sensitivity;
  }

  setSensitivity(sensitivity: number): void {
    this.sensitivity = sensitivity;
    this.stillnessThreshold = this.calculateThreshold();
    this.stillnessDuration = this.calculateDuration();
  }
}
