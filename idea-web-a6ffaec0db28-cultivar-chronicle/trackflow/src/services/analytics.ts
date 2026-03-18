import { Entry } from '../types';

export const calculateStreak = (entries: Entry[]) => {
  if (entries.length === 0) {
    return 0;
  }

  // Step 1: Fetch all timestamps (already have them in entries)
  const timestamps = entries.map(entry => entry.timestamp);

  // Step 2: Convert to date-only format (YYYY-MM-DD strings)
  const dateStrings = timestamps.map(ts => {
    const date = new Date(ts);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  });

  // Step 3: Deduplicate dates
  const uniqueDates = Array.from(new Set(dateStrings));

  // Step 4: Sort in descending order (most recent first)
  uniqueDates.sort((a, b) => b.localeCompare(a));

  // Step 5: Start from today or most recent entry
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  let streak = 0;
  let currentDateStr = uniqueDates[0] === todayStr ? todayStr : uniqueDates[0];

  // Step 6: Count backwards while dates are consecutive
  for (let i = 0; i < uniqueDates.length; i++) {
    if (uniqueDates[i] === currentDateStr) {
      streak++;
      // Calculate previous day
      const currentDate = new Date(currentDateStr);
      currentDate.setDate(currentDate.getDate() - 1);
      currentDateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
    } else {
      // Step 7: Stop at first gap
      break;
    }
  }

  return streak;
};
