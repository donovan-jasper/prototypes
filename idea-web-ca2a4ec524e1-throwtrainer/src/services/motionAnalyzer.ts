import { Accelerometer, Gyroscope } from 'expo-sensors';
import { ThrowData } from '../types';

class MotionAnalyzer {
  private isActive: boolean = false;
  private throwListeners: Array<(throwData: ThrowData) => void> = [];
  private lastAcceleration: { x: number; y: number; z: number } | null = null;
  private lastGyro: { x: number; y: number; z: number } | null = null;
  private throwThreshold: number = 1.5; // m/s²
  private minThrowDuration: number = 200; // ms
  private throwStartTime: number | null = null;
  private throwData: ThrowData | null = null;
  private calibrationData: { x: number; y: number; z: number } | null = null;

  start() {
    if (this.isActive) return;

    this.isActive = true;

    // Start accelerometer
    Accelerometer.setUpdateInterval(16); // ~60fps
    Accelerometer.addListener(accelerometerData => {
      this.handleAccelerometerData(accelerometerData);
    });

    // Start gyroscope
    Gyroscope.setUpdateInterval(16);
    Gyroscope.addListener(gyroscopeData => {
      this.handleGyroscopeData(gyroscopeData);
    });
  }

  stop() {
    if (!this.isActive) return;

    this.isActive = false;
    Accelerometer.removeAllListeners();
    Gyroscope.removeAllListeners();
  }

  onThrowDetected(listener: (throwData: ThrowData) => void) {
    this.throwListeners.push(listener);

    return {
      remove: () => {
        this.throwListeners = this.throwListeners.filter(l => l !== listener);
      }
    };
  }

  calibrate() {
    // Get current gravity vector for calibration
    if (this.lastAcceleration) {
      this.calibrationData = { ...this.lastAcceleration };
    }
  }

  private handleAccelerometerData(data: { x: number; y: number; z: number }) {
    if (!this.isActive) return;

    // Apply calibration if available
    const calibratedData = this.calibrationData
      ? {
          x: data.x - this.calibrationData.x,
          y: data.y - this.calibrationData.y,
          z: data.z - this.calibrationData.z
        }
      : data;

    // Calculate acceleration magnitude
    const magnitude = Math.sqrt(calibratedData.x ** 2 + calibratedData.y ** 2 + calibratedData.z ** 2);

    // Detect throw start (rapid acceleration)
    if (magnitude > this.throwThreshold && !this.throwStartTime) {
      this.throwStartTime = Date.now();
      this.throwData = {
        x: 0,
        y: 0,
        speed: 0,
        angle: 0,
        timestamp: Date.now()
      };
    }

    // Track throw in progress
    if (this.throwStartTime) {
      const duration = Date.now() - this.throwStartTime;

      // Simple speed calculation (integrate acceleration)
      if (this.throwData) {
        this.throwData.speed += magnitude * 0.01; // Simple approximation
      }

      // Detect throw end (acceleration drops below threshold)
      if (magnitude < this.throwThreshold && duration > this.minThrowDuration) {
        this.finalizeThrow();
      }
    }

    this.lastAcceleration = data;
  }

  private handleGyroscopeData(data: { x: number; y: number; z: number }) {
    if (!this.isActive || !this.throwStartTime || !this.throwData) return;

    // Calculate approximate angle from gyroscope data
    this.throwData.angle += Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2) * 0.1;

    // Estimate direction from gyroscope data
    if (this.throwData) {
      this.throwData.x = data.x * 0.1;
      this.throwData.y = data.y * 0.1;
    }

    this.lastGyro = data;
  }

  private finalizeThrow() {
    if (!this.throwData) return;

    // Estimate impact position from last gyro data
    if (this.lastGyro) {
      this.throwData.x = this.lastGyro.x * 0.5;
      this.throwData.y = this.lastGyro.y * 0.5;
    }

    // Notify listeners
    this.throwListeners.forEach(listener => listener(this.throwData!));

    // Reset throw tracking
    this.throwStartTime = null;
    this.throwData = null;
  }
}

export const motionAnalyzer = new MotionAnalyzer();
