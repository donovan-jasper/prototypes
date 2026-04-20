import { useState, useEffect } from 'react';
import { useDatabase } from './useDatabase';
import { Moment } from '../types';
import { MomentsService } from '../services/moments';

export function useMoments(userId: string) {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const db = useDatabase();
  const momentsService = new MomentsService();

  useEffect(() => {
    const fetchMoments = async () => {
      try {
        setLoading(true);
        const todayMoments = await momentsService.getTodayMoments(userId);
        setMoments(todayMoments);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load moments'));
      } finally {
        setLoading(false);
      }
    };

    fetchMoments();
  }, [userId, db]);

  const completeMoment = async (momentId: string, moodRating?: number) => {
    try {
      await momentsService.completeMoment(momentId, moodRating);
      // Refresh moments after completion
      const updatedMoments = await momentsService.getTodayMoments(userId);
      setMoments(updatedMoments);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to complete moment'));
    }
  };

  const getRandomMoment = async (category?: string): Promise<Moment | null> => {
    try {
      return await momentsService.getRandomMoment(category);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to get random moment'));
      return null;
    }
  };

  const refreshMoments = async () => {
    try {
      setLoading(true);
      const todayMoments = await momentsService.getTodayMoments(userId);
      setMoments(todayMoments);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh moments'));
    } finally {
      setLoading(false);
    }
  };

  return { moments, loading, error, completeMoment, getRandomMoment, refreshMoments };
}
