import { Accelerometer, Gyroscope } from 'expo-sensors';
import { Dimensions } from 'react-native';

interface ThrowData {
  speed: number;
  angle: number;
  hit: boolean;
}

interface TargetPosition {
  x: number;
  y: number;
}

interface AccelerometerData {
  x: number;
  y: number;
  z: number;
  timestamp?: number;
}

interface GyroscopeData {
  x: number;
  y: number;
  z: number;
}

const ACCELERATION_THRESHOLD = 2.5;
const DECELERATION_THRESHOLD = 1.0;
const HIT_THRESHOLD_PERCENT = 0.15;

let targetPosition: TargetPosition | null = null;
let deviceOrientation: GyroscopeData = { x: 0, y: 0, z: 0 };

export const setTargetPosition = (position: TargetPosition) => {
  targetPosition = position;
};

export const analyzeMotion = (callback: (result: ThrowData) => void) => {
  let throwInProgress = false;
  let peakAcceleration = 0;
  let peakOrientationData: GyroscopeData | null = null;

  const gyroscopeSubscription = Gyroscope.addListener((gyroscopeData) => {
    deviceOrientation = gyroscopeData;
  });

  const accelerometerSubscription = Accelerometer.addListener((accelerometerData) => {
    const { x, y, z } = accelerometerData;
    const accelerationMagnitude = Math.sqrt(x * x + y * y + z * z);

    if (accelerationMagnitude > ACCELERATION_THRESHOLD && !throwInProgress) {
      throwInProgress = true;
      peakAcceleration = accelerationMagnitude;
      peakOrientationData = { ...deviceOrientation };
    }

    if (throwInProgress && accelerationMagnitude > peakAcceleration) {
      peakAcceleration = accelerationMagnitude;
      peakOrientationData = { ...deviceOrientation };
    }

    if (throwInProgress && accelerationMagnitude < DECELERATION_THRESHOLD) {
      throwInProgress = false;
      
      if (peakOrientationData && targetPosition) {
        const aimPoint = calculateAimPoint(peakOrientationData);
        const hit = checkHit(aimPoint, targetPosition);
        const speed = peakAcceleration * 10;
        const angle = calculateAngle(peakOrientationData);
        
        callback({ speed, angle, hit });
      }
      
      peakAcceleration = 0;
      peakOrientationData = null;
    }
  });

  return {
    remove: () => {
      accelerometerSubscription.remove();
      gyroscopeSubscription.remove();
    },
    accelerometerCallback: (data: AccelerometerData) => {
      const magnitude = Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z);
      if (magnitude > ACCELERATION_THRESHOLD && targetPosition) {
        const aimPoint = calculateAimPoint(deviceOrientation);
        const hit = checkHit(aimPoint, targetPosition);
        const speed = magnitude * 10;
        const angle = calculateAngle(deviceOrientation);
        callback({ speed, angle, hit });
      }
    },
  };
};

const calculateAimPoint = (orientation: GyroscopeData): { x: number; y: number } => {
  const pitch = orientation.x;
  const roll = orientation.y;
  
  const centerX = 0.5;
  const centerY = 0.5;
  
  const aimX = centerX + (roll * 0.3);
  const aimY = centerY - (pitch * 0.3);
  
  return {
    x: Math.max(0, Math.min(1, aimX)),
    y: Math.max(0, Math.min(1, aimY)),
  };
};

const checkHit = (aimPoint: { x: number; y: number }, target: TargetPosition): boolean => {
  const dx = aimPoint.x - target.x;
  const dy = aimPoint.y - target.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  return distance <= HIT_THRESHOLD_PERCENT;
};

const calculateAngle = (orientation: GyroscopeData): number => {
  const pitch = orientation.x;
  const angle = pitch * (180 / Math.PI);
  return angle;
};
