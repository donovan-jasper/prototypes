import { AccelerometerData, GyroscopeData } from 'expo-sensors';
import * as FileSystem from 'expo-file-system';

const CALIBRATION_FILE = FileSystem.documentDirectory + 'postureCalibration.json';

interface PostureResult {
  isCorrect: boolean;
  angle: number;
  feedback: string;
  calibrationOffset: number;
}

interface CalibrationData {
  accelerometer: AccelerometerData;
  gyroscope: GyroscopeData;
  timestamp: number;
}

export class PostureDetector {
  public calibrationData: CalibrationData[] = [];
  public isCalibrated = false;
  public calibrationOffset = 0;
  public calibrationProgress = 0;
  private exerciseThresholds: Record<string, { min: number; max: number }> = {
    'chin-tuck': { min: -15, max: 15 },
    'shoulder-squeeze': { min: -10, max: 10 },
    'neck-roll': { min: -30, max: 30 },
    'cat-cow': { min: -20, max: 20 },
    'seated-spinal-twist': { min: -25, max: 25 }
  };

  constructor() {
    this.initializeExerciseThresholds();
  }

  private initializeExerciseThresholds(): void {
    // Can be expanded with more precise thresholds for each exercise
  }

  public startCalibration(): void {
    this.calibrationData = [];
    this.isCalibrated = false;
    this.calibrationOffset = 0;
    this.calibrationProgress = 0;
  }

  public addCalibrationSample(accelerometer: AccelerometerData, gyroscope: GyroscopeData): void {
    this.calibrationData.push({
      accelerometer,
      gyroscope,
      timestamp: Date.now()
    });

    this.calibrationProgress = Math.min(100, (this.calibrationData.length / 100) * 100);

    if (this.calibrationData.length >= 100) {
      this.calculateCalibrationOffset();
      this.isCalibrated = true;
    }
  }

  private calculateCalibrationOffset(): void {
    const angles = this.calibrationData.map(data => {
      const { x, y, z } = data.accelerometer;
      return Math.atan2(x, Math.sqrt(y * y + z * z)) * (180 / Math.PI);
    });

    const sum = angles.reduce((a, b) => a + b, 0);
    this.calibrationOffset = sum / angles.length;
  }

  public detectPosture(
    accelerometer: AccelerometerData,
    gyroscope: GyroscopeData,
    exerciseId: string
  ): PostureResult {
    if (!this.isCalibrated) {
      return {
        isCorrect: false,
        angle: 0,
        feedback: "Please complete calibration first",
        calibrationOffset: this.calibrationOffset
      };
    }

    const { x, y, z } = accelerometer;
    const currentAngle = Math.atan2(x, Math.sqrt(y * y + z * z)) * (180 / Math.PI);
    const angle = currentAngle - this.calibrationOffset;

    const thresholds = this.exerciseThresholds[exerciseId] || { min: -10, max: 10 };
    const isCorrect = angle >= thresholds.min && angle <= thresholds.max;

    let feedback = "";
    if (angle < thresholds.min) {
      feedback = "Tilt your head forward slightly";
    } else if (angle > thresholds.max) {
      feedback = "Tilt your head back slightly";
    } else {
      feedback = "Perfect posture!";
    }

    return {
      isCorrect,
      angle,
      feedback,
      calibrationOffset: this.calibrationOffset
    };
  }

  public isHoldingCorrectly(
    currentDuration: number,
    requiredDuration: number,
    exerciseId: string
  ): boolean {
    if (exerciseId === 'chin-tuck') {
      return currentDuration >= requiredDuration * 1.2;
    }
    return currentDuration >= requiredDuration;
  }

  public async saveCalibrationData(): Promise<void> {
    const dataToSave = {
      calibrationOffset: this.calibrationOffset,
      isCalibrated: this.isCalibrated,
      timestamp: Date.now()
    };
    try {
      await FileSystem.writeAsStringAsync(CALIBRATION_FILE, JSON.stringify(dataToSave));
      console.log('Calibration data saved successfully.');
    } catch (error) {
      console.error('Failed to save calibration data:', error);
    }
  }

  public async loadCalibrationData(): Promise<void> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(CALIBRATION_FILE);
      if (fileInfo.exists) {
        const savedData = await FileSystem.readAsStringAsync(CALIBRATION_FILE);
        const parsedData = JSON.parse(savedData);
        this.calibrationOffset = parsedData.calibrationOffset;
        this.isCalibrated = parsedData.isCalibrated;
        console.log('Calibration data loaded successfully.');
      } else {
        console.log('No calibration data found.');
        this.isCalibrated = false;
        this.calibrationOffset = 0;
      }
    } catch (error) {
      console.error('Failed to load calibration data:', error);
      this.isCalibrated = false;
      this.calibrationOffset = 0;
    }
  }

  public getIsCalibrated(): boolean {
    return this.isCalibrated;
  }
}

export const postureDetector = new PostureDetector();
