import { initDatabase, seedAffirmations, getCurrentStreak, getStreakData, calculateStreakWithGraceDays, updateStreak } from './database';
import affirmationsData from '../assets/affirmations.json';
import { format, startOfWeek, endOfWeek, differenceInDays, isSameWeek } from 'date-fns';
import { MILESTONE_DAYS } from './constants';

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

export const calculateStreak = async (date: Date) => {
  const { streakCount, isGraceDay } = await calculateStreakWithGraceDays(date);
  const today = format(date, 'yyyy-MM-dd');
  await updateStreak(today, isGraceDay, streakCount);
  return streakCount;
};

export const shouldShowMilestone = (streakCount: number) => {
  return MILESTONE_DAYS.includes(streakCount);
};

export const getStreakDataForCalendar = async () => {
  await initDatabase();

  // Get all streak records for the current month
  const today = new Date();
  const monthStart = format(startOfWeek(today), 'yyyy-MM-dd');
  const monthEnd = format(endOfWeek(today), 'yyyy-MM-dd');

  const streaks = await getStreakData();

  // Format for calendar display
  return streaks.map(streak => ({
    date: streak.date,
    isGraceDay: streak.is_grace_day === 1
  }));
};

export const getMilestoneDates = (currentDate: Date) => {
  return MILESTONE_DAYS.map(days => {
    const milestoneDate = new Date(currentDate);
    milestoneDate.setDate(currentDate.getDate() - days);
    return format(milestoneDate, 'yyyy-MM-dd');
  });
};

export const getGraceDaysUsedThisWeek = async (date: Date) => {
  const weekStart = startOfWeek(date);
  const weekEnd = endOfWeek(date);

  const streaks = await getStreakData();
  const graceDays = streaks.filter(streak => {
    const streakDate = new Date(streak.date);
    return streak.is_grace_day === 1 &&
           streakDate >= weekStart &&
           streakDate <= weekEnd;
  });

  return graceDays.length;
};
