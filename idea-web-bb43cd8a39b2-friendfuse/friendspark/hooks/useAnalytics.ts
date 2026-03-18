import { useState, useEffect } from 'react';
import { getAnalyticsSummary, getFriendsNeedingAttention, getLongestStreaks } from '../lib/analytics';
import { useFriends } from './useFriends';

export const useAnalytics = () => {
  const { friends } = useFriends();
  const [summary, setSummary] = useState({ totalFriends: 0, averageStreak: 0, interactionsThisMonth: 0 });
  const [friendsNeedingAttention, setFriendsNeedingAttention] = useState([]);
  const [longestStreaks, setLongestStreaks] = useState([]);

  const loadAnalytics = async () => {
    const summaryData = await getAnalyticsSummary(friends);
    setSummary(summaryData);

    const needingAttention = await getFriendsNeedingAttention(friends);
    setFriendsNeedingAttention(needingAttention);

    const streaks = await getLongestStreaks(friends);
    setLongestStreaks(streaks);
  };

  useEffect(() => {
    if (friends.length > 0) {
      loadAnalytics();
    }
  }, [friends]);

  return { summary, friendsNeedingAttention, longestStreaks };
};
