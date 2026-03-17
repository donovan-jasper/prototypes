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
  depth: number;
}

interface AccelerometerData {
  x: number;
  y: number;
  z: number;
  timestamp?: number;
}

const GRAVITY = 9.8; // m/s²
const WINDOW_SIZE = 500; // ms
const ACCELERATION_THRESHOLD = 2.5; // m/s²
const DECELERATION_THRESHOLD = 1.0; // m/s²
const HIT_ZONE_RADIUS = 0.3; // meters
const HIT_ZONE_DEPTH = 0.2; // meters

let motionWindow: AccelerometerData[] = [];
let targetPosition: TargetPosition | null = null;

export const setTargetPosition = (position: TargetPosition) => {
  targetPosition = position;
};

export const analyzeMotion = (callback: (result: ThrowData) => void) => {
  let lastAcceleration = { x: 0, y: 0, z: 0 };
  let lastRotation = { x: 0, y: 0, z: 0 };
  let throwInProgress = false;
  let peakAcceleration = 0;
  let peakAccelerationData: AccelerometerData | null = null;

  const accelerometerSubscription = Accelerometer.addListener((accelerometerData) => {
    const now = Date.now();
    const { x, y, z } = accelerometerData;
    
    // Add to motion window
    motionWindow.push({ x, y, z, timestamp: now });
    
    // Remove old data outside window
    motionWindow = motionWindow.filter(data => 
      data.timestamp && (now - data.timestamp) <= WINDOW_SIZE
    );

    const accelerationMagnitude = Math.sqrt(x * x + y * y + z * z);

    // Detect throw initiation (acceleration spike)
    if (accelerationMagnitude > ACCELERATION_THRESHOLD && !throwInProgress) {
      throwInProgress = true;
      peakAcceleration = accelerationMagnitude;
      peakAccelerationData = { x, y, z, timestamp: now };
    }

    // Track peak during throw
    if (throwInProgress && accelerationMagnitude > peakAcceleration) {
      peakAcceleration = accelerationMagnitude;
      peakAccelerationData = { x, y, z, timestamp: now };
    }

    // Detect throw completion (deceleration)
    if (throwInProgress && accelerationMagnitude < DECELERATION_THRESHOLD) {
      throwInProgress = false;
      
      if (peakAccelerationData) {
        // Calculate initial velocity from peak acceleration
        const velocity = calculateInitialVelocity(peakAccelerationData);
        
        // Project trajectory
        const trajectory = projectTrajectory(velocity);
        
        // Check for hit
        const hit = targetPosition ? checkHit(trajectory, targetPosition) : false;
        
        // Calculate speed and angle
        const speed = Math.sqrt(
          velocity.x * velocity.x + 
          velocity.y * velocity.y + 
          velocity.z * velocity.z
        );
        const angle = calculateAngle(velocity);
        
        callback({ speed, angle, hit, trajectory });
      }
      
      // Reset for next throw
      peakAcceleration = 0;
      peakAccelerationData = null;
      motionWindow = [];
    }

    lastAcceleration = accelerometerData;
  });

  const gyroscopeSubscription = Gyroscope.addListener((gyroscopeData) => {
    lastRotation = gyroscopeData;
  });

  return {
    remove: () => {
      accelerometerSubscription.remove();
      gyroscopeSubscription.remove();
    },
    accelerometerCallback: (data: AccelerometerData) => {
      // For testing
      const now = Date.now();
      motionWindow.push({ ...data, timestamp: now });
      motionWindow = motionWindow.filter(d => 
        d.timestamp && (now - d.timestamp) <= WINDOW_SIZE
      );
      
      const magnitude = Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z);
      if (magnitude > ACCELERATION_THRESHOLD) {
        const velocity = calculateInitialVelocity(data);
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

const calculateInitialVelocity = (peakAcceleration: AccelerometerData): { x: number; y: number; z: number } => {
  // Estimate velocity from acceleration
  // v = a * t (simplified, assuming constant acceleration over short period)
  const dt = 0.1; // 100ms estimation window
  
  return {
    x: peakAcceleration.x * dt,
    y: peakAcceleration.y * dt,
    z: peakAcceleration.z * dt,
  };
};

const projectTrajectory = (
  initialVelocity: { x: number; y: number; z: number }
): { x: number; y: number; z: number }[] => {
  const trajectory: { x: number; y: number; z: number }[] = [];
  const dt = 0.05; // 50ms time steps
  const maxTime = 2.0; // 2 seconds max flight time
  
  let x = 0, y = 0, z = 0;
  let vx = initialVelocity.x;
  let vy = initialVelocity.y;
  let vz = initialVelocity.z;
  
  for (let t = 0; t < maxTime; t += dt) {
    // Update position
    x += vx * dt;
    y += vy * dt;
    z += vz * dt;
    
    // Apply gravity (assuming y is vertical)
    vy -= GRAVITY * dt;
    
    trajectory.push({ x, y, z });
    
    // Stop if trajectory goes below ground
    if (y < 0) break;
  }
  
  return trajectory;
};

const checkHit = (
  trajectory: { x: number; y: number; z: number }[],
  target: TargetPosition
): boolean => {
  // Convert target screen position to 3D space
  // Assuming screen coordinates are normalized (0-1)
  // and depth is in meters
  const targetX = (target.x - 0.5) * 2; // Convert to -1 to 1 range
  const targetY = (0.5 - target.y) * 2; // Invert Y and convert
  const targetZ = target.depth;
  
  // Check if any point in trajectory intersects cylindrical hit zone
  for (const point of trajectory) {
    // Calculate distance from target center in XY plane
    const dx = point.x - targetX;
    const dy = point.y - targetY;
    const radialDistance = Math.sqrt(dx * dx + dy * dy);
    
    // Check depth distance
    const depthDistance = Math.abs(point.z - targetZ);
    
    // Hit if within cylindrical zone
    if (radialDistance <= HIT_ZONE_RADIUS && depthDistance <= HIT_ZONE_DEPTH) {
      return true;
    }
  }
  
  return false;
};

const calculateAngle = (velocity: { x: number; y: number; z: number }): number => {
  // Calculate angle from horizontal (in degrees)
  const horizontalSpeed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
  const angle = Math.atan2(velocity.y, horizontalSpeed) * (180 / Math.PI);
  return angle;
};
