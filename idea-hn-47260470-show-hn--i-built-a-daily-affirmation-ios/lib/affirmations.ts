import { initDatabase, seedAffirmations } from './database';
import affirmationsData from '../assets/affirmations.json';

let initialized = false;

export const initAffirmations = async () => {
  if (!initialized) {
    await initDatabase();
    await seedAffirmations(affirmationsData);
    initialized = true;
  }
};

export const getAffirmationForContext = async (timeOfDay: string, moodRating: number, streakCount: number) => {
  await initAffirmations();
  return affirmationsData[0];
};

export const calculateStreak = async (sessions: any[]) => {
  return 0;
};

export const shouldShowMilestone = (streakCount: number) => {
  return [7, 30, 100, 365].includes(streakCount);
};
