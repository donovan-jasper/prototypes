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
  private gravityVector: { x: number; y: number; z: number } | null = null;
  private deviceOrientation: { alpha: number; beta: number; gamma: number } | null = null;

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
      this.gravityVector = { ...this.lastAcceleration };
    }

    // Get device orientation from gyroscope
    if (this.lastGyro) {
      this.deviceOrientation = {
        alpha: this.lastGyro.x,
        beta: this.lastGyro.y,
        gamma: this.lastGyro.z
      };
    }
  }

  private handleAccelerometerData(data: { x: number; y: number; z: number }) {
    if (!this.isActive) return;

    // Apply gravity calibration if available
    const calibratedData = this.gravityVector
      ? {
          x: data.x - this.gravityVector.x,
          y: data.y - this.gravityVector.y,
          z: data.z - this.gravityVector.z
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
        z: 0,
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
      this.throwData.z = data.z * 0.1;
    }

    this.lastGyro = data;
  }

  private finalizeThrow() {
    if (!this.throwData) return;

    // Apply device orientation correction
    if (this.deviceOrientation) {
      const { alpha, beta, gamma } = this.deviceOrientation;

      // Simple orientation correction (in a real app, use proper rotation matrices)
      this.throwData.x = this.throwData.x * Math.cos(alpha) - this.throwData.y * Math.sin(alpha);
      this.throwData.y = this.throwData.x * Math.sin(alpha) + this.throwData.y * Math.cos(alpha);

      // Apply pitch and roll corrections
      this.throwData.z = this.throwData.z * Math.cos(beta) - this.throwData.y * Math.sin(beta);
      this.throwData.y = this.throwData.z * Math.sin(beta) + this.throwData.y * Math.cos(beta);
    }

    // Notify listeners
    this.throwListeners.forEach(listener => listener(this.throwData!));

    // Reset throw tracking
    this.throwStartTime = null;
    this.throwData = null;
  }

  private calculatePhysicsBasedTrajectory(): ThrowData | null {
    if (!this.throwData || !this.gravityVector) return null;

    const gravity = 9.8; // m/s²
    const airDensity = 1.225; // kg/m³ at sea level
    const dragCoefficient = 0.47; // for a sphere
    const crossSectionalArea = 0.001; // m² (approximate for a ball)

    // Calculate drag force
    const speed = this.throwData.speed;
    const dragForce = 0.5 * airDensity * dragCoefficient * crossSectionalArea * speed * speed;

    // Calculate acceleration due to drag
    const dragAcceleration = dragForce / 0.145; // mass of a baseball

    // Calculate trajectory with physics
    const timeOfFlight = (2 * speed * Math.sin(this.throwData.angle)) / gravity;
    const horizontalDistance = speed * Math.cos(this.throwData.angle) * timeOfFlight;

    // Apply drag effect to speed
    const adjustedSpeed = speed - (dragAcceleration * timeOfFlight);

    return {
      ...this.throwData,
      speed: adjustedSpeed,
      x: this.throwData.x * horizontalDistance,
      y: this.throwData.y * horizontalDistance,
      z: this.throwData.z * horizontalDistance
    };
  }
}

export const motionAnalyzer = new MotionAnalyzer();
