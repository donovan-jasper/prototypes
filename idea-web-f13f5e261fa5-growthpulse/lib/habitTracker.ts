export const calculateStreak = (dates: string[]): number => {
  if (dates.length === 0) return 0;

  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i - 1]);
    const currentDate = new Date(dates[i]);
    const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};
