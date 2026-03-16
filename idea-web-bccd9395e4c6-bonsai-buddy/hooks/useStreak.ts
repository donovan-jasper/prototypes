import { useState, useEffect } from 'react';
import { getStreak, updateStreak } from '../lib/database';

export const useStreak = () => {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadStreak = async () => {
    setLoading(true);
    try {
      const streak = await getStreak();
      setCurrentStreak(streak);
    } catch (error) {
      console.error('Error loading streak:', error);
    } finally {
      setLoading(false);
    }
  };

  const incrementStreak = async () => {
    const newStreak = currentStreak + 1;
    await updateStreak(newStreak);
    setCurrentStreak(newStreak);
  };

  useEffect(() => {
    loadStreak();
  }, []);

  return { currentStreak, loading, loadStreak, incrementStreak };
};
