import { getInteractions } from './database';
import { differenceInDays, isSameDay } from 'date-fns';

export const calculateStreaks = async (friends) => {
  const streaks = {};

  for (const friend of friends) {
    const interactions = await getInteractions(friend.id);
    if (interactions.length === 0) {
      streaks[friend.id] = null;
      continue;
    }

    const sortedInteractions = interactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const lastInteraction = new Date(sortedInteractions[0].timestamp);
    const today = new Date();

    let currentStreak = 1;
    let previousDate = lastInteraction;

    for (let i = 1; i < sortedInteractions.length; i++) {
      const currentDate = new Date(sortedInteractions[i].timestamp);
      const daysDiff = differenceInDays(previousDate, currentDate);

      if (daysDiff === 1) {
        currentStreak++;
        previousDate = currentDate;
      } else if (daysDiff > 1) {
        break;
      }
    }

    const daysSinceLastInteraction = differenceInDays(today, lastInteraction);
    const status = daysSinceLastInteraction > 7 ? 'at-risk' : 'active';

    streaks[friend.id] = {
      current: currentStreak,
      longest: currentStreak, // Simplified for prototype
      lastInteraction,
      status,
    };
  }

  return streaks;
};
