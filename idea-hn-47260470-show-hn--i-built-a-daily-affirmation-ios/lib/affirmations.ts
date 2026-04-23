import { initDatabase, seedAffirmations, getCurrentStreak, getStreakData, calculateStreakWithGraceDays, updateStreak } from './database';
import affirmationsData from '../assets/affirmations.json';
import { format, startOfWeek, endOfWeek, differenceInDays, isSameWeek, parseISO, isBefore, subDays } from 'date-fns';
import { MILESTONE_DAYS, MAX_GRACE_DAYS_PER_WEEK } from './constants';

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

  // Get all streak records
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
    const streakDate = parseISO(streak.date);
    return streak.is_grace_day === 1 &&
           streakDate >= weekStart &&
           streakDate <= weekEnd;
  });

  return graceDays.length;
};

export const calculateStreakWithGraceDays = async (currentDate: Date) => {
  const streaks = await getStreakData();
  const today = format(currentDate, 'yyyy-MM-dd');

  // If no streaks yet, start a new one
  if (streaks.length === 0) {
    return { streakCount: 1, isGraceDay: false };
  }

  // Sort streaks by date
  const sortedStreaks = [...streaks].sort((a, b) =>
    isBefore(parseISO(a.date), parseISO(b.date)) ? -1 : 1
  );

  // Get the most recent streak record
  const lastStreak = sortedStreaks[sortedStreaks.length - 1];
  const lastDate = parseISO(lastStreak.date);

  // Calculate days difference
  const daysDiff = differenceInDays(currentDate, lastDate);

  if (daysDiff === 1) {
    // Consecutive day - increment streak
    return { streakCount: lastStreak.streak_count + 1, isGraceDay: false };
  } else if (daysDiff > 1) {
    // Check if we can use a grace day
    const graceDaysUsed = await getGraceDaysUsedThisWeek(currentDate);

    if (graceDaysUsed < MAX_GRACE_DAYS_PER_WEEK) {
      // Use a grace day - don't break streak
      return { streakCount: lastStreak.streak_count, isGraceDay: true };
    } else {
      // No grace days left - reset streak
      return { streakCount: 1, isGraceDay: false };
    }
  }

  // Same day - return current streak
  return { streakCount: lastStreak.streak_count, isGraceDay: lastStreak.is_grace_day === 1 };
};

export const getConsecutiveStreakGroups = async (currentDate: Date) => {
  const streaks = await getStreakData();
  const sortedStreaks = [...streaks].sort((a, b) =>
    isBefore(parseISO(a.date), parseISO(b.date)) ? -1 : 1
  );

  const consecutiveGroups: { start: string; end: string; length: number }[] = [];
  let currentGroup: string[] = [];

  sortedStreaks.forEach((streak, index) => {
    const streakDate = parseISO(streak.date);

    if (index === 0) {
      currentGroup.push(streak.date);
      return;
    }

    const prevStreakDate = parseISO(sortedStreaks[index - 1].date);
    const daysDiff = differenceInDays(streakDate, prevStreakDate);

    if (daysDiff === 1) {
      currentGroup.push(streak.date);
    } else {
      if (currentGroup.length > 0) {
        const start = currentGroup[0];
        const end = currentGroup[currentGroup.length - 1];
        consecutiveGroups.push({
          start,
          end,
          length: currentGroup.length
        });
        currentGroup = [streak.date];
      }
    }
  });

  // Add the last group if it exists
  if (currentGroup.length > 0) {
    const start = currentGroup[0];
    const end = currentGroup[currentGroup.length - 1];
    consecutiveGroups.push({
      start,
      end,
      length: currentGroup.length
    });
  }

  return consecutiveGroups;
};

export const getLongestStreak = async () => {
  const groups = await getConsecutiveStreakGroups(new Date());
  if (groups.length === 0) return 0;

  const longest = groups.reduce((max, group) =>
    group.length > max ? group.length : max, 0);

  return longest;
};
