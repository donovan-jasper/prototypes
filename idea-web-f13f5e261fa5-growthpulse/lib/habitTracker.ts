export const calculateStreak = (dates: string[]): number => {
  if (dates.length === 0) return 0;

  // Sort dates in descending order
  const sortedDates = [...dates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  let streak = 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if the most recent date is today
  const mostRecentDate = new Date(sortedDates[0]);
  mostRecentDate.setHours(0, 0, 0, 0);

  if (mostRecentDate.getTime() !== today.getTime()) {
    // Check if the most recent date was yesterday
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (mostRecentDate.getTime() === yesterday.getTime()) {
      streak = 1;
    } else {
      return 0;
    }
  }

  // Check for consecutive days
  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = new Date(sortedDates[i]);
    const previousDate = new Date(sortedDates[i - 1]);

    currentDate.setHours(0, 0, 0, 0);
    previousDate.setHours(0, 0, 0, 0);

    const diffTime = previousDate.getTime() - currentDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      streak++;
    } else if (diffDays > 1) {
      // Non-consecutive days break the streak
      break;
    }
    // If diffDays is 0, it's the same day (duplicate entry)
  }

  return streak;
};

export const calculateTimeZoneAdjustedStreak = (dates: string[], userTimeZone: string): number => {
  if (dates.length === 0) return 0;

  // Convert dates to user's timezone
  const timeZoneAdjustedDates = dates.map(date => {
    const utcDate = new Date(date);
    return new Date(utcDate.toLocaleString('en-US', { timeZone: userTimeZone }));
  });

  // Sort dates in descending order
  const sortedDates = [...timeZoneAdjustedDates].sort((a, b) => b.getTime() - a.getTime());

  let streak = 1;
  const today = new Date(new Date().toLocaleString('en-US', { timeZone: userTimeZone }));
  today.setHours(0, 0, 0, 0);

  // Check if the most recent date is today in user's timezone
  const mostRecentDate = new Date(sortedDates[0]);
  mostRecentDate.setHours(0, 0, 0, 0);

  if (mostRecentDate.getTime() !== today.getTime()) {
    // Check if the most recent date was yesterday in user's timezone
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (mostRecentDate.getTime() === yesterday.getTime()) {
      streak = 1;
    } else {
      return 0;
    }
  }

  // Check for consecutive days
  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = new Date(sortedDates[i]);
    const previousDate = new Date(sortedDates[i - 1]);

    currentDate.setHours(0, 0, 0, 0);
    previousDate.setHours(0, 0, 0, 0);

    const diffTime = previousDate.getTime() - currentDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      streak++;
    } else if (diffDays > 1) {
      // Non-consecutive days break the streak
      break;
    }
    // If diffDays is 0, it's the same day (duplicate entry)
  }

  return streak;
};
