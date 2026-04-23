import { format, differenceInDays, isSameWeek, startOfWeek, endOfWeek, parseISO, isBefore, isAfter } from 'date-fns';
import { getStreakData } from './database';
import { MAX_GRACE_DAYS_PER_WEEK } from './constants';

interface StreakDay {
  date: string;
  isGraceDay: boolean;
  streakCount: number;
}

export const calculateStreakWithGraceDays = async (currentDate: Date): Promise<{ streakCount: number; isGraceDay: boolean }> => {
  const streakData = await getStreakData();
  const today = format(currentDate, 'yyyy-MM-dd');

  // If no streak data, start a new streak
  if (streakData.length === 0) {
    return { streakCount: 1, isGraceDay: false };
  }

  // Sort streak data by date in descending order
  const sortedStreaks = streakData.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Check if today is already in the streak data
  const todayStreak = sortedStreaks.find(streak => streak.date === today);
  if (todayStreak) {
    return {
      streakCount: todayStreak.streakCount,
      isGraceDay: todayStreak.isGraceDay
    };
  }

  // Get the most recent streak day
  const lastStreakDate = parseISO(sortedStreaks[0].date);
  const daysSinceLastStreak = differenceInDays(currentDate, lastStreakDate);

  // If it's the same day, return existing streak
  if (daysSinceLastStreak === 0) {
    return {
      streakCount: sortedStreaks[0].streakCount,
      isGraceDay: sortedStreaks[0].isGraceDay
    };
  }

  // If it's exactly one day since last streak, continue streak
  if (daysSinceLastStreak === 1) {
    return {
      streakCount: sortedStreaks[0].streakCount + 1,
      isGraceDay: false
    };
  }

  // If more than one day since last streak, check if we can use a grace day
  const graceDaysUsedThisWeek = await getGraceDaysUsedThisWeek(currentDate);

  if (graceDaysUsedThisWeek < MAX_GRACE_DAYS_PER_WEEK) {
    // Use a grace day
    return {
      streakCount: sortedStreaks[0].streakCount + 1,
      isGraceDay: true
    };
  } else {
    // No grace days left, reset streak
    return {
      streakCount: 1,
      isGraceDay: false
    };
  }
};

export const getGraceDaysUsedThisWeek = async (date: Date): Promise<number> => {
  const weekStart = startOfWeek(date);
  const weekEnd = endOfWeek(date);

  const streaks = await getStreakData();
  const graceDays = streaks.filter(streak => {
    const streakDate = parseISO(streak.date);
    return streak.isGraceDay === 1 &&
           streakDate >= weekStart &&
           streakDate <= weekEnd;
  });

  return graceDays.length;
};

export const getConsecutiveStreakGroups = async (month: Date): Promise<Array<{ start: string; end: string }>> => {
  const streaks = await getStreakData();
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);

  // Filter streaks for the current month
  const monthStreaks = streaks.filter(streak => {
    const streakDate = parseISO(streak.date);
    return streakDate >= monthStart && streakDate <= monthEnd;
  });

  // Sort by date
  monthStreaks.sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  const groups = [];
  let currentGroup = null;

  for (let i = 0; i < monthStreaks.length; i++) {
    const currentDate = parseISO(monthStreaks[i].date);
    const prevDate = i > 0 ? parseISO(monthStreaks[i - 1].date) : null;

    if (!prevDate || differenceInDays(currentDate, prevDate) > 1) {
      // Start new group
      if (currentGroup) {
        groups.push(currentGroup);
      }
      currentGroup = {
        start: monthStreaks[i].date,
        end: monthStreaks[i].date
      };
    } else {
      // Continue current group
      if (currentGroup) {
        currentGroup.end = monthStreaks[i].date;
      }
    }
  }

  // Add the last group if it exists
  if (currentGroup) {
    groups.push(currentGroup);
  }

  return groups;
};
