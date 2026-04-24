import { getInteractions } from './database';
import { differenceInDays, startOfDay, parseISO } from 'date-fns';

const normalizeDateToMidnightUTC = (date: Date): Date => {
  const normalized = startOfDay(date);
  return new Date(Date.UTC(normalized.getFullYear(), normalized.getMonth(), normalized.getDate()));
};

export type StreakStatus = 'active' | 'at-risk' | 'broken';

export interface Streak {
  current: number;
  longest: number;
  lastInteraction: Date;
  status: StreakStatus;
}

export const calculateStreaks = async (friends: { id: string }[]): Promise<Record<string, Streak | null>> => {
  const streaks: Record<string, Streak | null> = {};

  for (const friend of friends) {
    const interactions = await getInteractions(friend.id);
    if (interactions.length === 0) {
      streaks[friend.id] = null;
      continue;
    }

    // Group interactions by calendar day
    const interactionsByDay = new Map<string, Date>();
    interactions.forEach(interaction => {
      const date = parseISO(interaction.timestamp);
      const normalizedDate = normalizeDateToMidnightUTC(date);
      const dateKey = normalizedDate.toISOString();

      if (!interactionsByDay.has(dateKey)) {
        interactionsByDay.set(dateKey, normalizedDate);
      }
    });

    // Get unique dates sorted chronologically (newest first)
    const uniqueDates = Array.from(interactionsByDay.values()).sort((a, b) => b.getTime() - a.getTime());

    if (uniqueDates.length === 0) {
      streaks[friend.id] = null;
      continue;
    }

    const lastInteraction = uniqueDates[0];
    const today = normalizeDateToMidnightUTC(new Date());
    const daysSinceLastInteraction = differenceInDays(today, lastInteraction);

    // Calculate current active streak
    let currentStreak = 0;
    let currentDate = today;

    while (true) {
      const dateKey = currentDate.toISOString();
      if (interactionsByDay.has(dateKey)) {
        currentStreak++;
        currentDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
      } else {
        break;
      }
    }

    // Calculate longest consecutive streak in history
    let longestStreak = 1;
    let tempStreak = 1;

    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const currentDate = uniqueDates[i];
      const nextDate = uniqueDates[i + 1];
      const daysDiff = differenceInDays(currentDate, nextDate);

      if (daysDiff === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }

    // Determine status
    let status: StreakStatus;
    if (daysSinceLastInteraction > 7 && currentStreak === 0) {
      status = 'broken';
    } else if (daysSinceLastInteraction >= 5 && daysSinceLastInteraction <= 7) {
      status = 'at-risk';
    } else {
      status = 'active';
    }

    streaks[friend.id] = {
      current: currentStreak,
      longest: longestStreak,
      lastInteraction,
      status,
    };
  }

  return streaks;
};

export const getStreakEmoji = (streak: number): string => {
  if (streak >= 30) return '🔥🔥🔥';
  if (streak >= 14) return '🔥🔥';
  if (streak >= 7) return '🔥';
  if (streak >= 3) return '✨';
  return '💡';
};

export const getStreakColor = (status: StreakStatus): string => {
  switch (status) {
    case 'active': return '#4CAF50'; // Green
    case 'at-risk': return '#FF9800'; // Orange
    case 'broken': return '#F44336'; // Red
    default: return '#9E9E9E'; // Gray
  }
};
