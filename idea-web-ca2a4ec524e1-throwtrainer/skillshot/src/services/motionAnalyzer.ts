import { Accelerometer, Gyroscope } from 'expo-sensors';

interface ThrowData {
  speed: number;
  angle: number;
  hit: boolean;
  trajectory?: { x: number; y: number; z: number }[];
}

interface TargetPosition {
  x: number;
  y: number;
  z: number;
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

const GRAVITY = 9.8;
const WINDOW_SIZE = 500;
const ACCELERATION_THRESHOLD = 2.5;
const DECELERATION_THRESHOLD = 1.0;
const HIT_ZONE_RADIUS = 0.15;
const HIT_ZONE_DEPTH = 0.2;

let motionWindow: AccelerometerData[] = [];
let targetPosition: TargetPosition | null = null;
let deviceOrientation: GyroscopeData = { x: 0, y: 0, z: 0 };

export const setTargetPosition = (position: TargetPosition) => {
  targetPosition = position;
};

export const analyzeMotion = (callback: (result: ThrowData) => void) => {
  let lastAcceleration = { x: 0, y: 0, z: 0 };
  let throwInProgress = false;
  let peakAcceleration = 0;
  let peakAccelerationData: AccelerometerData | null = null;
  let throwStartTime = 0;

  const gyroscopeSubscription = Gyroscope.addListener((gyroscopeData) => {
    deviceOrientation = gyroscopeData;
  });

  const accelerometerSubscription = Accelerometer.addListener((accelerometerData) => {
    const now = Date.now();
    const { x, y, z } = accelerometerData;
    
    motionWindow.push({ x, y, z, timestamp: now });
    motionWindow = motionWindow.filter(data => 
      data.timestamp && (now - data.timestamp) <= WINDOW_SIZE
    );

    const accelerationMagnitude = Math.sqrt(x * x + y * y + z * z);

    if (accelerationMagnitude > ACCELERATION_THRESHOLD && !throwInProgress) {
      throwInProgress = true;
      throwStartTime = now;
      peakAcceleration = accelerationMagnitude;
      peakAccelerationData = { x, y, z, timestamp: now };
    }

    if (throwInProgress && accelerationMagnitude > peakAcceleration) {
      peakAcceleration = accelerationMagnitude;
      peakAccelerationData = { x, y, z, timestamp: now };
    }

    if (throwInProgress && accelerationMagnitude < DECELERATION_THRESHOLD) {
      throwInProgress = false;
      
      if (peakAccelerationData) {
        const throwDuration = (now - throwStartTime) / 1000;
        const velocity = calculateInitialVelocity(peakAccelerationData, throwDuration);
        const trajectory = projectTrajectory(velocity);
        const hit = targetPosition ? checkHit(trajectory, targetPosition) : false;
        
        const speed = Math.sqrt(
          velocity.x * velocity.x + 
          velocity.y * velocity.y + 
          velocity.z * velocity.z
        );
        const angle = calculateAngle(velocity);
        
        callback({ speed, angle, hit, trajectory });
      }
      
      peakAcceleration = 0;
      peakAccelerationData = null;
      motionWindow = [];
    }

    lastAcceleration = accelerometerData;
  });

  return {
    remove: () => {
      accelerometerSubscription.remove();
      gyroscopeSubscription.remove();
    },
    accelerometerCallback: (data: AccelerometerData) => {
      const now = Date.now();
      motionWindow.push({ ...data, timestamp: now });
      motionWindow = motionWindow.filter(d => 
        d.timestamp && (now - d.timestamp) <= WINDOW_SIZE
      );
      
      const magnitude = Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z);
      if (magnitude > ACCELERATION_THRESHOLD) {
        const velocity = calculateInitialVelocity(data, 0.1);
        const trajectory = projectTrajectory(velocity);
        const hit = targetPosition ? checkHit(trajectory, targetPosition) : false;
        const speed = Math.sqrt(
          velocity.x * velocity.x + 
          velocity.y * velocity.y + 
          velocity.z * velocity.z
        );
        const angle = calculateAngle(velocity);
        callback({ speed, angle, hit, trajectory });
      }
    },
  };
};

const calculateInitialVelocity = (
  peakAcceleration: AccelerometerData,
  duration: number
): { x: number; y: number; z: number } => {
  const dt = Math.max(duration, 0.05);
  
  const rotationMatrix = getRotationMatrix(deviceOrientation);
  const worldAcceleration = applyRotation(peakAcceleration, rotationMatrix);
  
  return {
    x: worldAcceleration.x * dt * 10,
    y: worldAcceleration.y * dt * 10,
    z: worldAcceleration.z * dt * 10,
  };
};

const getRotationMatrix = (orientation: GyroscopeData): number[][] => {
  const { x, y, z } = orientation;
  
  const cosX = Math.cos(x);
  const sinX = Math.sin(x);
  const cosY = Math.cos(y);
  const sinY = Math.sin(y);
  const cosZ = Math.cos(z);
  const sinZ = Math.sin(z);
  
  return [
    [cosY * cosZ, -cosY * sinZ, sinY],
    [sinX * sinY * cosZ + cosX * sinZ, -sinX * sinY * sinZ + cosX * cosZ, -sinX * cosY],
    [-cosX * sinY * cosZ + sinX * sinZ, cosX * sinY * sinZ + sinX * cosZ, cosX * cosY],
  ];
};

const applyRotation = (
  vector: { x: number; y: number; z: number },
  matrix: number[][]
): { x: number; y: number; z: number } => {
  return {
    x: matrix[0][0] * vector.x + matrix[0][1] * vector.y + matrix[0][2] * vector.z,
    y: matrix[1][0] * vector.x + matrix[1][1] * vector.y + matrix[1][2] * vector.z,
    z: matrix[2][0] * vector.x + matrix[2][1] * vector.y + matrix[2][2] * vector.z,
  };
};

const projectTrajectory = (
  initialVelocity: { x: number; y: number; z: number }
): { x: number; y: number; z: number }[] => {
  const trajectory: { x: number; y: number; z: number }[] = [];
  const dt = 0.05;
  const maxTime = 2.0;
  
  let x = 0, y = 0, z = 0;
  let vx = initialVelocity.x;
  let vy = initialVelocity.y;
  let vz = initialVelocity.z;
  
  for (let t = 0; t < maxTime; t += dt) {
    x += vx * dt;
    y += vy * dt;
    z += vz * dt;
    
    vy -= GRAVITY * dt;
    
    trajectory.push({ x, y, z });
    
    if (y < -5) break;
  }
  
  return trajectory;
};

const checkHit = (
  trajectory: { x: number; y: number; z: number }[],
  target: TargetPosition
): boolean => {
  for (const point of trajectory) {
    const dx = point.x - target.x;
    const dy = point.y - target.y;
    const dz = point.z - target.z;
    
    const radialDistance = Math.sqrt(dx * dx + dy * dy);
    const depthDistance = Math.abs(dz);
    
    if (radialDistance <= HIT_ZONE_RADIUS && depthDistance <= HIT_ZONE_DEPTH) {
      return true;
    }
  }
  
  return false;
};

const calculateAngle = (velocity: { x: number; y: number; z: number }): number => {
  const horizontalSpeed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
  const angle = Math.atan2(velocity.y, horizontalSpeed) * (180 / Math.PI);
  return angle;
};
