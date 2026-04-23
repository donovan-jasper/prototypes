import { Attempt } from '../types';
import * as THREE from 'three';

export interface ThrowData {
  speed: number;
  angle: number;
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

export function calculateAccuracy(hits: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((hits / total) * 100);
}

export function detectPersonalRecord(currentStats: {
  bestAccuracy: number;
  bestStreak: number;
  bestSpeed: number;
}, newAttempt: Attempt): {
  isNewAccuracyRecord: boolean;
  isNewStreakRecord: boolean;
  isNewSpeedRecord: boolean;
} {
  const newAccuracy = calculateAccuracy(
    currentStats.bestAccuracy * (currentStats.bestStreak || 1),
    currentStats.bestStreak || 1
  );

  return {
    isNewAccuracyRecord: newAttempt.success && calculateAccuracy(1, 1) > newAccuracy,
    isNewStreakRecord: false, // Would need session history to calculate
    isNewSpeedRecord: newAttempt.speed > currentStats.bestSpeed
  };
}

export function calculateStreak(sessions: Array<{ date: Date; accuracy: number }>): number {
  if (sessions.length === 0) return 0;

  // Sort sessions by date (newest first)
  const sortedSessions = [...sessions].sort((a, b) => b.date.getTime() - a.date.getTime());

  let streak = 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if today has a session
  const todaySession = sortedSessions.find(session => {
    const sessionDate = new Date(session.date);
    sessionDate.setHours(0, 0, 0, 0);
    return sessionDate.getTime() === today.getTime();
  });

  if (!todaySession) return 0;

  // Check previous days
  for (let i = 1; i < sortedSessions.length; i++) {
    const currentDate = new Date(sortedSessions[i - 1].date);
    const previousDate = new Date(sortedSessions[i].date);

    currentDate.setHours(0, 0, 0, 0);
    previousDate.setHours(0, 0, 0, 0);

    // Check if dates are consecutive
    const diffTime = Math.abs(currentDate.getTime() - previousDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export function calculateThrowDirection(acceleration: { x: number; y: number; z: number }, gyro: { x: number; y: number; z: number }): ThrowData {
  // Calculate speed from acceleration magnitude
  const speed = Math.sqrt(acceleration.x ** 2 + acceleration.y ** 2 + acceleration.z ** 2);

  // Calculate angle from gyroscope data
  const angle = Math.atan2(gyro.y, gyro.x) * (180 / Math.PI);

  // Simple direction calculation from sensor data
  // In a real app, this would use more sophisticated physics
  return {
    speed,
    angle,
    x: acceleration.x + gyro.x * 0.5,
    y: acceleration.y + gyro.y * 0.5,
    z: -1, // Fixed forward direction for simplicity
    timestamp: Date.now()
  };
}

export function calculatePhysicsBasedTrajectory(throwData: ThrowData): ThrowData {
  const gravity = 9.8; // m/s²
  const airDensity = 1.225; // kg/m³ at sea level
  const dragCoefficient = 0.47; // for a sphere
  const crossSectionalArea = 0.001; // m² (approximate for a ball)
  const mass = 0.145; // kg (baseball mass)

  // Calculate drag force
  const dragForce = 0.5 * airDensity * dragCoefficient * crossSectionalArea * throwData.speed * throwData.speed;

  // Calculate acceleration due to drag
  const dragAcceleration = dragForce / mass;

  // Calculate time of flight
  const timeOfFlight = (2 * throwData.speed * Math.sin(throwData.angle * Math.PI / 180)) / gravity;

  // Calculate horizontal distance
  const horizontalDistance = throwData.speed * Math.cos(throwData.angle * Math.PI / 180) * timeOfFlight;

  // Apply drag effect to speed
  const adjustedSpeed = throwData.speed - (dragAcceleration * timeOfFlight);

  // Calculate adjusted trajectory
  return {
    ...throwData,
    speed: adjustedSpeed,
    x: throwData.x * horizontalDistance,
    y: throwData.y * horizontalDistance,
    z: throwData.z * horizontalDistance
  };
}

export function calculateTrajectoryPoints(start: THREE.Vector3, end: THREE.Vector3, speed: number, angle: number): THREE.Vector3[] {
  const points = [];
  const gravity = 9.8; // m/s²
  const timeOfFlight = (2 * speed * Math.sin(angle * Math.PI / 180)) / gravity;

  // Calculate points along the trajectory
  for (let t = 0; t <= timeOfFlight; t += 0.1) {
    const x = start.x + (end.x - start.x) * (t / timeOfFlight);
    const y = start.y + (end.y - start.y) * (t / timeOfFlight);

    // Parabolic height with physics-based adjustment
    const height = speed * Math.sin(angle * Math.PI / 180) * t - 0.5 * gravity * t * t;

    points.push(new THREE.Vector3(x, y + height, start.z - t * 2));
  }

  return points;
}

export function screenToWorldCoordinates(
  screenX: number,
  screenY: number,
  camera: THREE.PerspectiveCamera,
  viewportWidth: number,
  viewportHeight: number
): THREE.Vector3 {
  // Convert screen coordinates to normalized device coordinates (-1 to +1)
  const x = (screenX / viewportWidth) * 2 - 1;
  const y = -(screenY / viewportHeight) * 2 + 1;

  // Create a vector in normalized device coordinates
  const vector = new THREE.Vector3(x, y, 0.5); // 0.5 is the near plane

  // Unproject the vector to world coordinates
  vector.unproject(camera);

  // Calculate direction vector
  const direction = vector.sub(camera.position).normalize();

  // Create a ray from camera position through the unprojected point
  const raycaster = new THREE.Raycaster(camera.position, direction);

  // For simplicity, we'll assume the target is on a plane at z=0
  // In a real app, you might want to use a more sophisticated intersection test
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const intersection = new THREE.Vector3();

  raycaster.ray.intersectPlane(plane, intersection);

  return intersection;
}

export function checkCollisionWithTarget(
  trajectoryPoints: THREE.Vector3[],
  targetPosition: THREE.Vector3,
  targetRadius: number
): boolean {
  // Check if any point in the trajectory is within the target radius
  for (const point of trajectoryPoints) {
    const distance = point.distanceTo(targetPosition);
    if (distance <= targetRadius) {
      return true;
    }
  }

  return false;
}
