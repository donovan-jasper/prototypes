export function calculateConnectionScore(lastContactDate: string | null): number {
  if (!lastContactDate) {
    return 0;
  }

  const now = new Date();
  const lastContact = new Date(lastContactDate);
  const daysSince = Math.floor((now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24));

  // Exponential decay curve for connection score
  if (daysSince <= 7) return 100;
  if (daysSince <= 14) return 80;
  if (daysSince <= 30) return 60;
  if (daysSince <= 60) return 40;
  if (daysSince <= 90) return 20;
  return 0;
}

export function getConnectionStatus(score: number): 'thriving' | 'maintaining' | 'neglecting' {
  if (score >= 70) return 'thriving';
  if (score >= 40) return 'maintaining';
  return 'neglecting';
}

export function getConnectionColor(score: number): string {
  if (score >= 70) return '#4CAF50'; // Green
  if (score >= 40) return '#FFC107'; // Yellow
  return '#F44336'; // Red
}

export function getDaysSinceLastContact(lastContactDate: string | null): number {
  if (!lastContactDate) return 999;

  const now = new Date();
  const lastContact = new Date(lastContactDate);
  return Math.floor((now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24));
}

export interface StreakState {
  currentDays: number;
  longestDays: number;
  lastInteraction: string | null;
  freezeUsed: boolean;
  freezeAvailable: boolean;
}

export function calculateStreak(
  lastInteractionDate: string | null,
  currentStreakDays: number,
  freezeStatus: { used: boolean; available: boolean }
): { updatedStreakDays: number; freezeUsed: boolean } {
  const now = new Date();
  const lastInteraction = lastInteractionDate ? new Date(lastInteractionDate) : null;

  // If no previous interaction, start fresh streak
  if (!lastInteraction) {
    return {
      updatedStreakDays: 0,
      freezeUsed: false
    };
  }

  const daysSince = Math.floor((now.getTime() - lastInteraction.getTime()) / (1000 * 60 * 60 * 24));

  // If interaction was today, increment streak
  if (daysSince === 0) {
    return {
      updatedStreakDays: currentStreakDays + 1,
      freezeUsed: false
    };
  }

  // If interaction was yesterday, continue streak
  if (daysSince === 1) {
    return {
      updatedStreakDays: currentStreakDays + 1,
      freezeUsed: false
    };
  }

  // If streak was broken (more than 1 day since last interaction)
  // Check if freeze is available and not used yet
  if (freezeStatus.available && !freezeStatus.used && currentStreakDays > 0) {
    return {
      updatedStreakDays: currentStreakDays,
      freezeUsed: true
    };
  }

  // If freeze is used or not available, reset streak
  return {
    updatedStreakDays: 0,
    freezeUsed: false
  };
}

export function freezeStreak(currentStreak: StreakState): StreakState {
  if (currentStreak.freezeUsed || !currentStreak.freezeAvailable) {
    throw new Error('Streak freeze already used or not available');
  }

  return {
    ...currentStreak,
    freezeUsed: true,
    freezeAvailable: false
  };
}

export function resetMonthlyFreeze(): StreakState {
  return {
    currentDays: 0,
    longestDays: 0,
    lastInteraction: null,
    freezeUsed: false,
    freezeAvailable: true
  };
}
