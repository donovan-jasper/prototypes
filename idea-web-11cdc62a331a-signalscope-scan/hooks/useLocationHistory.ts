import { useState, useEffect } from 'react';
import { getRecentReadings, initDatabase } from '@/services/database';
import { SignalReading } from '@/services/database';

export function useLocationHistory(limit: number = 50) {
  const [readings, setReadings] = useState<SignalReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await initDatabase();
      const data = await getRecentReadings(limit);
      setReadings(data);
    } catch (err) {
      console.error('Error loading location history:', err);
      setError('Failed to load location history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [limit]);

  return { readings, isLoading, error, refresh };
}
