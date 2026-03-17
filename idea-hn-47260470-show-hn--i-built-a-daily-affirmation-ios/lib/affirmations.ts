import { initDatabase, seedAffirmations, getCurrentStreak } from './database';
import affirmationsData from '../assets/affirmations.json';
import { format, startOfWeek, endOfWeek } from 'date-fns';

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

  // Filter affirmations by time of day
  let filtered = affirmationsData.filter(a => a.time_of_day === timeOfDay);

  // Adjust based on mood rating
  if (moodRating <= 2) {
    // If user is feeling low, show lower energy affirmations
    filtered = filtered.filter(a => a.energy_level <= 2);
  }

  // If we have no matches, fall back to general affirmations
  if (filtered.length === 0) {
    filtered = affirmationsData.filter(a => a.category === 'general');
  }

  // Select a random affirmation from the filtered list
  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex];
};

export const calculateStreak = async (sessions: any[]) => {
  if (sessions.length === 0) return 0;

  // Get current streak from database
  return await getCurrentStreak();
};

export const shouldShowMilestone = (streakCount: number) => {
  return [7, 30, 100, 365].includes(streakCount);
};

export const getStreakDataForCalendar = async () => {
  await initDatabase();

  // Get all streak records for the current month
  const today = new Date();
  const monthStart = format(startOfWeek(today), 'yyyy-MM-dd');
  const monthEnd = format(endOfWeek(today), 'yyyy-MM-dd');

  const streaks = await db.getAllAsync(
    'SELECT * FROM streaks WHERE date BETWEEN ? AND ? ORDER BY date ASC',
    [monthStart, monthEnd]
  );

  // Format for calendar display
  return streaks.map(streak => ({
    date: streak.date,
    isGraceDay: streak.is_grace_day === 1
  }));
};
