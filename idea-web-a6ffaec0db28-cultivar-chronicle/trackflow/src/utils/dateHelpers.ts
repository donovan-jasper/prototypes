export const isConsecutiveDay = (date1: Date, date2: Date) => {
  const day1 = date1.getDate();
  const day2 = date2.getDate();
  return day2 - day1 === 1;
};

export const formatStreakDate = (date: Date) => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
