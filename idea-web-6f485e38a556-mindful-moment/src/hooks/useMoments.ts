import { useState, useEffect } from 'react';
import { useDatabase } from './useDatabase';
import { Moment } from '../types';

export function useMoments() {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const db = useDatabase();

  useEffect(() => {
    const fetchMoments = async () => {
      try {
        setLoading(true);
        const allMoments = await db.getAllMoments();
        setMoments(allMoments);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load moments'));
      } finally {
        setLoading(false);
      }
    };

    fetchMoments();
  }, [db]);

  const completeMoment = async (momentId: string, moodRating?: number) => {
    try {
      await db.completeMoment(momentId, moodRating);
      // Refresh moments after completion
      const updatedMoments = await db.getAllMoments();
      setMoments(updatedMoments);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to complete moment'));
    }
  };

  const getRandomMoment = async (category?: string): Promise<Moment | null> => {
    try {
      return await db.getRandomMoment(category);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to get random moment'));
      return null;
    }
  };

  return { moments, loading, error, completeMoment, getRandomMoment };
}
