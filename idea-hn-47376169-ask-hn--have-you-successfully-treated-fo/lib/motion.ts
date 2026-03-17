import { AccelerometerData, GyroscopeData } from 'expo-sensors';

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
  private calibrationData: CalibrationData[] = [];
  private isCalibrated = false;
  private calibrationOffset = 0;
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
  }

  public addCalibrationSample(accelerometer: AccelerometerData, gyroscope: GyroscopeData): void {
    this.calibrationData.push({
      accelerometer,
      gyroscope,
      timestamp: Date.now()
    });

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
        calibrationOffset: 0
      };
    }

    const { x, y, z } = accelerometer;
    const angle = Math.atan2(x, Math.sqrt(y * y + z * z)) * (180 / Math.PI) - this.calibrationOffset;

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
    // Different hold requirements based on exercise
    if (exerciseId === 'chin-tuck') {
      return currentDuration >= requiredDuration * 1.2; // More precise for chin tucks
    }
    return currentDuration >= requiredDuration;
  }

  public saveCalibrationData(): void {
    // Save calibration data to AsyncStorage for persistence
    const dataToSave = {
      calibrationOffset: this.calibrationOffset,
      timestamp: Date.now()
    };
    // In a real app, you would use AsyncStorage here
    // AsyncStorage.setItem('postureCalibration', JSON.stringify(dataToSave));
  }

  public loadCalibrationData(): void {
    // Load calibration data from AsyncStorage
    // In a real app, you would use AsyncStorage here
    // const savedData = await AsyncStorage.getItem('postureCalibration');
    // if (savedData) {
    //   const parsedData = JSON.parse(savedData);
    //   this.calibrationOffset = parsedData.calibrationOffset;
    //   this.isCalibrated = true;
    // }
  }
}

export const postureDetector = new PostureDetector();
