import { useState, useEffect, useCallback } from 'react';
import { calculateStreaks, Streak } from '../lib/streaks';
import { useFriends } from './useFriends';

export const useStreaks = () => {
  const { friends, refreshFriends } = useFriends();
  const [streaks, setStreaks] = useState<Record<string, Streak | null>>({});
  const [isLoading, setIsLoading] = useState(true);

  const refreshStreaks = useCallback(async () => {
    setIsLoading(true);
    try {
      const calculatedStreaks = await calculateStreaks(friends);
      setStreaks(calculatedStreaks);
    } catch (error) {
      console.error('Error calculating streaks:', error);
    } finally {
      setIsLoading(false);
    }
  }, [friends]);

  useEffect(() => {
    refreshStreaks();
  }, [refreshStreaks]);

  return {
    streaks,
    isLoading,
    refreshStreaks,
  };
};
