import { Entry } from '../types';

export const calculateStreak = (entries: Entry[]) => {
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < entries.length; i++) {
    const entryDate = new Date(entries[i].timestamp);
    entryDate.setHours(0, 0, 0, 0);

    if (entryDate.getTime() === today.getTime() - i * 24 * 60 * 60 * 1000) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
};
