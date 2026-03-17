import { useState, useEffect } from 'react';
import { useDatabase } from './useDatabase';

export function useStreak() {
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const db = useDatabase();

  useEffect(() => {
    const calculateStreak = async () => {
      try {
        setLoading(true);
        // Get all completed moments sorted by date
        const completedMoments = await db.getCompletedMoments();

        if (completedMoments.length === 0) {
          setStreak(0);
          return;
        }

        // Calculate streak
        let currentStreak = 1;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 1; i < completedMoments.length; i++) {
          const prevDate = new Date(completedMoments[i-1].completed_at);
          prevDate.setHours(0, 0, 0, 0);

          const currentDate = new Date(completedMoments[i].completed_at);
          currentDate.setHours(0, 0, 0, 0);

          const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            currentStreak++;
          } else {
            break;
          }
        }

        setStreak(currentStreak);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to calculate streak'));
      } finally {
        setLoading(false);
      }
    };

    calculateStreak();
  }, [db]);

  return { streak, loading, error };
}
