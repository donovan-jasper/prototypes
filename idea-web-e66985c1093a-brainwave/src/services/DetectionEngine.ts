import { SensorData } from '../types';

type ProfileType = 'study' | 'work' | 'audiobook' | 'meditation' | 'driving';

interface ProfileConfig {
  stillnessThreshold: number;
  movementThreshold: number;
  escalationTime: number;
  maxAlertLevel: number;
}

const PROFILE_CONFIGS: Record<ProfileType, ProfileConfig> = {
  study: {
    stillnessThreshold: 0.1,
    movementThreshold: 0.5,
    escalationTime: 30000,
    maxAlertLevel: 3
  },
  work: {
    stillnessThreshold: 0.15,
    movementThreshold: 0.6,
    escalationTime: 25000,
    maxAlertLevel: 3
  },
  audiobook: {
    stillnessThreshold: 0.08,
    movementThreshold: 0.4,
    escalationTime: 35000,
    maxAlertLevel: 2
  },
  meditation: {
    stillnessThreshold: 0.05,
    movementThreshold: 0.3,
    escalationTime: 40000,
    maxAlertLevel: 2
  },
  driving: {
    stillnessThreshold: 0.2,
    movementThreshold: 0.8,
    escalationTime: 20000,
    maxAlertLevel: 4
  }
};

export class DetectionEngine {
  private profile: ProfileType;
  private dataBuffer: SensorData[] = [];
  private isDrowsyState = false;
  private alertLevel = 0;
  private lastAlertTime = 0;
  private sensitivityMultiplier = 1.0;

  constructor(profile: ProfileType) {
    this.profile = profile;
  }

  processSensorData(data: SensorData): void {
    // Add new data point to buffer (keep last 5 seconds at 100ms intervals)
    this.dataBuffer.push(data);
    if (this.dataBuffer.length > 50) {
      this.dataBuffer.shift();
    }

    // Only analyze if we have enough data points
    if (this.dataBuffer.length >= 50) {
      this.analyzeMovement();
    }
  }

  private analyzeMovement(): void {
    const config = PROFILE_CONFIGS[this.profile];
    const adjustedStillness = config.stillnessThreshold * this.sensitivityMultiplier;
    const adjustedMovement = config.movementThreshold * this.sensitivityMultiplier;

    // Calculate movement variance over the 5-second window
    const variances = this.dataBuffer.map((data, i, arr) => {
      if (i === 0) return 0;

      const prev = arr[i - 1];
      const dx = data.x - prev.x;
      const dy = data.y - prev.y;
      const dz = data.z - prev.z;

      return Math.sqrt(dx * dx + dy * dy + dz * dz);
    });

    const totalVariance = variances.reduce((sum, v) => sum + v, 0);
    const avgVariance = totalVariance / variances.length;

    // Determine drowsiness state
    if (avgVariance < adjustedStillness) {
      this.isDrowsyState = true;
      this.escalateAlert();
    } else if (avgVariance > adjustedMovement) {
      this.isDrowsyState = false;
      this.resetAlert();
    }
  }

  private escalateAlert(): void {
    const now = Date.now();
    const config = PROFILE_CONFIGS[this.profile];

    if (this.alertLevel === 0) {
      this.alertLevel = 1;
      this.lastAlertTime = now;
    } else if (now - this.lastAlertTime > config.escalationTime) {
      this.alertLevel = Math.min(this.alertLevel + 1, config.maxAlertLevel);
      this.lastAlertTime = now;
    }
  }

  isDrowsy(): boolean {
    return this.isDrowsyState;
  }

  getAlertLevel(): number {
    return this.alertLevel;
  }

  resetAlert(): void {
    this.alertLevel = 0;
    this.isDrowsyState = false;
  }

  reset(): void {
    this.dataBuffer = [];
    this.resetAlert();
  }

  adjustSensitivity(multiplier: number): void {
    this.sensitivityMultiplier = Math.max(0.5, Math.min(2.0, multiplier));
  }

  getSensitivity(): number {
    return this.sensitivityMultiplier;
  }

  getCurrentProfile(): ProfileType {
    return this.profile;
  }

  setProfile(profile: ProfileType): void {
    this.profile = profile;
    this.reset();
  }
}
