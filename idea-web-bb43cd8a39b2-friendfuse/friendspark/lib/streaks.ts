import { getInteractions } from './database';
import { differenceInDays, startOfDay, parseISO } from 'date-fns';

const normalizeDateToMidnightUTC = (date: Date): Date => {
  const normalized = startOfDay(date);
  return new Date(Date.UTC(normalized.getFullYear(), normalized.getMonth(), normalized.getDate()));
};

export const calculateStreaks = async (friends) => {
  const streaks = {};

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

    // Get unique dates sorted chronologically
    const uniqueDates = Array.from(interactionsByDay.values()).sort((a, b) => b.getTime() - a.getTime());
    
    if (uniqueDates.length === 0) {
      streaks[friend.id] = null;
      continue;
    }

    const lastInteraction = uniqueDates[0];
    const today = normalizeDateToMidnightUTC(new Date());
    const daysSinceLastInteraction = differenceInDays(today, lastInteraction);

    // Calculate current active streak (from today or yesterday backwards)
    let currentStreak = 0;
    if (daysSinceLastInteraction <= 1) {
      let expectedDate = daysSinceLastInteraction === 0 ? today : normalizeDateToMidnightUTC(new Date(today.getTime() - 24 * 60 * 60 * 1000));
      
      for (const date of uniqueDates) {
        if (date.getTime() === expectedDate.getTime()) {
          currentStreak++;
          expectedDate = new Date(expectedDate.getTime() - 24 * 60 * 60 * 1000);
        } else if (date.getTime() < expectedDate.getTime()) {
          break;
        }
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
    let status: 'active' | 'at-risk' | 'broken';
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
