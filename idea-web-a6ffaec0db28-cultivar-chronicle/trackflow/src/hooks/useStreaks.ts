import { useState, useEffect } from 'react';
import { getStreakCount } from '../services/database';

export const useStreaks = (categoryId: number) => {
  const [streak, setStreak] = useState<number>(0);

  useEffect(() => {
    const fetchStreak = async () => {
      const streakCount = await getStreakCount(categoryId);
      setStreak(streakCount);
    };
    fetchStreak();
  }, [categoryId]);

  return { streak };
};
