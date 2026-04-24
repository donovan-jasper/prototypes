import { Interaction } from '../types';
import { differenceInDays, isToday } from 'date-fns';

export interface Streak {
  current: number;
  longest: number;
  lastInteraction: Date | null;
  status: 'active' | 'at-risk' | 'broken';
}

export const calculateStreak = (interactions: Interaction[]): Streak => {
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

  const lastInteraction = new Date(sortedInteractions[0].timestamp);
  const today = new Date();

  // If last interaction was today, streak is 1
  if (isToday(lastInteraction)) {
    return {
      current: 1,
      longest: 1,
      lastInteraction,
      status: 'active'
    };
  }

  // Calculate days since last interaction
  const daysSinceLast = differenceInDays(today, lastInteraction);

  // If more than 7 days since last interaction, streak is broken
  if (daysSinceLast > 7) {
    return {
      current: 0,
      longest: 0,
      lastInteraction,
      status: 'broken'
    };
  }

  // Calculate current streak (consecutive days with at least one interaction)
  let currentStreak = 1;
  let longestStreak = 1;
  let previousDate = lastInteraction;

  for (let i = 1; i < sortedInteractions.length; i++) {
    const currentDate = new Date(sortedInteractions[i].timestamp);
    const daysDiff = differenceInDays(previousDate, currentDate);

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
    lastInteraction,
    status
  };
};

export const calculateFriendshipScore = (interactions: Interaction[], challenges: any[]): number => {
  if (interactions.length === 0) return 0;

  // Calculate interaction frequency score (0-100)
  const today = new Date();
  const firstInteraction = new Date(interactions[interactions.length - 1].timestamp);
  const daysActive = differenceInDays(today, firstInteraction) + 1;
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
