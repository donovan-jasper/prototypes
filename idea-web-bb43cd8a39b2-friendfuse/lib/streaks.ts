import { Interaction } from '../types';
import { differenceInCalendarDays, isSameDay, startOfDay } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';

export interface Streak {
  current: number;
  longest: number;
  lastInteraction: Date | null;
  status: 'active' | 'at-risk' | 'broken';
}

export const calculateStreak = (interactions: Interaction[], timezone: string = 'UTC'): Streak => {
  if (interactions.length === 0) {
    return {
      current: 0,
      longest: 0,
      lastInteraction: null,
      status: 'broken'
    };
  }

  // Sort interactions by date (newest first)
  const sortedInteractions = [...interactions].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const lastInteractionLocal = new Date(sortedInteractions[0].timestamp);
  const nowLocal = new Date();

  // Convert all dates to local timezone for comparison
  const localInteractions = interactions.map(interaction => ({
    ...interaction,
    timestamp: utcToZonedTime(new Date(interaction.timestamp), timezone)
  }));

  // Group interactions by calendar day in local timezone
  const interactionsByDay: Record<string, Interaction[]> = {};
  localInteractions.forEach(interaction => {
    const dateKey = startOfDay(new Date(interaction.timestamp)).toISOString();
    if (!interactionsByDay[dateKey]) {
      interactionsByDay[dateKey] = [];
    }
    interactionsByDay[dateKey].push(interaction);
  });

  const interactionDays = Object.keys(interactionsByDay).sort().reverse();
  const todayKey = startOfDay(nowLocal).toISOString();

  // Check if there was an interaction today in local time
  const todayInteractions = interactionsByDay[todayKey];
  if (todayInteractions && todayInteractions.length > 0) {
    return {
      current: 1,
      longest: 1,
      lastInteraction: lastInteractionLocal,
      status: 'active'
    };
  }

  // Calculate days since last interaction in calendar days (local time)
  const daysSinceLast = differenceInCalendarDays(nowLocal, lastInteractionLocal);

  // If more than 7 days since last interaction, streak is broken
  if (daysSinceLast > 7) {
    return {
      current: 0,
      longest: 0,
      lastInteraction: lastInteractionLocal,
      status: 'broken'
    };
  }

  // Calculate current streak (consecutive calendar days with at least one interaction)
  let currentStreak = 1;
  let longestStreak = 1;
  let previousDate = new Date(interactionDays[0]);

  for (let i = 1; i < interactionDays.length; i++) {
    const currentDate = new Date(interactionDays[i]);
    const daysDiff = differenceInCalendarDays(previousDate, currentDate);

    if (daysDiff === 1) {
      currentStreak++;
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }
    } else if (daysDiff > 1) {
      break;
    }

    previousDate = currentDate;
  }

  // Determine streak status
  let status: 'active' | 'at-risk' | 'broken' = 'active';
  if (daysSinceLast > 3) {
    status = 'at-risk';
  }

  return {
    current: currentStreak,
    longest: longestStreak,
    lastInteraction: lastInteractionLocal,
    status
  };
};

export const calculateFriendshipScore = (interactions: Interaction[], challenges: any[]): number => {
  if (interactions.length === 0) return 0;

  // Calculate interaction frequency score (0-100)
  const today = new Date();
  const firstInteraction = new Date(interactions[interactions.length - 1].timestamp);
  const daysActive = differenceInCalendarDays(today, firstInteraction) + 1;
  const interactionFrequency = (interactions.length / daysActive) * 100;
  const frequencyScore = Math.min(interactionFrequency, 100);

  // Calculate interaction variety score (0-100)
  const interactionTypes = new Set(interactions.map(i => i.type));
  const varietyScore = (interactionTypes.size / 3) * 100; // Max 3 types

  // Calculate challenge completion score (0-100)
  const completedChallenges = challenges.filter(c => c.status === 'completed').length;
  const challengeScore = (completedChallenges / challenges.length) * 100 || 0;

  // Calculate overall score (weighted average)
  const score = (frequencyScore * 0.4) + (varietyScore * 0.3) + (challengeScore * 0.3);

  return Math.round(score);
};
