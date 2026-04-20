import { useState, useEffect } from 'react';
import { useDatabase } from './useDatabase';

export function useStreak(userId: string) {
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const db = useDatabase();

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        setLoading(true);
        const currentStreak = await db.getCurrentStreak(userId);
        setStreak(currentStreak);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load streak'));
      } finally {
        setLoading(false);
      }
    };

    fetchStreak();
  }, [userId, db]);

  const updateStreak = async () => {
    try {
      const newStreak = await db.updateStreak(userId);
      setStreak(newStreak);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update streak'));
    }
  };

  return { streak, loading, error, updateStreak };
}
