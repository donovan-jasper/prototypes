import { useState, useEffect } from 'react';
import { calculateStreaks } from '../lib/streaks';
import { useFriends } from './useFriends';

export const useStreaks = () => {
  const { friends } = useFriends();
  const [streaks, setStreaks] = useState({});

  const refreshStreaks = async () => {
    const streaksData = await calculateStreaks(friends);
    setStreaks(streaksData);
  };

  useEffect(() => {
    refreshStreaks();
  }, [friends]);

  return { streaks, refreshStreaks };
};
