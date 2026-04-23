import { Attempt } from '../types';

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

export function calculateThrowDirection(acceleration: { x: number; y: number; z: number }, gyro: { x: number; y: number; z: number }): { x: number; y: number; z: number } {
  // Simple direction calculation from sensor data
  // In a real app, this would use more sophisticated physics
  return {
    x: acceleration.x + gyro.x * 0.5,
    y: acceleration.y + gyro.y * 0.5,
    z: -1 // Fixed forward direction for simplicity
  };
}
