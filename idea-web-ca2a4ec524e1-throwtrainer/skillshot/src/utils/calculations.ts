export const calculateAccuracy = (hits, total) => {
  return Math.round((hits / total) * 100);
};

export const detectPersonalRecord = (currentStats, newAttempt) => {
  return newAttempt.speed > currentStats.maxSpeed || newAttempt.angle > currentStats.maxAngle;
};

export const calculateStreak = (sessions) => {
  // Placeholder, implement streak calculation
  return sessions.length;
};
