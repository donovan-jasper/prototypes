import { useState, useEffect } from 'react';
import { getStreak, updateStreak, getLastCheckIn } from '../services/database';

export const useStreak = () => {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [lastCheckIn, setLastCheckIn] = useState<Date | null>(null);

  useEffect(() => {
    const loadStreak = async () => {
      const streak = await getStreak();
      const lastCheckInDate = await getLastCheckIn();
      setCurrentStreak(streak);
      setLastCheckIn(lastCheckInDate);
    };

    loadStreak();
  }, []);

  const recordCheckIn = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (lastCheckIn) {
      const lastCheckInDate = new Date(lastCheckIn);
      lastCheckInDate.setHours(0, 0, 0, 0);

      if (today.getTime() === lastCheckInDate.getTime()) {
        // Already checked in today
        return;
      }

      const diffTime = Math.abs(today.getTime() - lastCheckInDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day
        const newStreak = currentStreak + 1;
        setCurrentStreak(newStreak);
        await updateStreak(newStreak, today);
      } else if (diffDays > 1) {
        // Broken streak
        setCurrentStreak(1);
        await updateStreak(1, today);
      }
    } else {
      // First check-in
      setCurrentStreak(1);
      await updateStreak(1, today);
    }

    setLastCheckIn(today);
  };

  return { currentStreak, recordCheckIn };
};
