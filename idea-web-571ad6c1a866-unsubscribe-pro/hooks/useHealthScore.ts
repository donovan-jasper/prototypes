import { useState, useEffect } from 'react';
import { getDatabase } from '../lib/database';

interface WeeklyStat {
  date: string;
  score: number;
  unsubscribed: number;
}

export const useHealthScore = () => {
  const [healthScore, setHealthScore] = useState(0);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStat[]>([]);
  const [streakCount, setStreakCount] = useState(0);
  const [timeSaved, setTimeSaved] = useState(0);

  useEffect(() => {
    const loadHealthData = async () => {
      const db = await getDatabase();

      // Calculate health score (simplified for example)
      // In a real app, this would be more sophisticated
      const totalEmails = await db.getFirstValue('SELECT COUNT(*) FROM emails');
      const unsubscribed = await db.getFirstValue('SELECT COUNT(*) FROM emails WHERE unsubscribed = 1');

      const score = Math.min(100, (unsubscribed / (totalEmails || 1)) * 100 * 2);
      setHealthScore(score);

      // Get weekly stats
      const stats = await db.getAll('SELECT date, score, unsubscribed FROM weekly_stats ORDER BY date DESC LIMIT 7');
      setWeeklyStats(stats.reverse());

      // Get streak count
      const streak = await db.getFirstValue('SELECT streak FROM user_stats');
      setStreakCount(streak || 0);

      // Calculate time saved (assuming 30 seconds per email)
      const timeSavedMinutes = unsubscribed * 0.5;
      setTimeSaved(timeSavedMinutes / 60);
    };

    loadHealthData();

    // Set up periodic refresh
    const interval = setInterval(loadHealthData, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, []);

  return {
    healthScore,
    weeklyStats,
    streakCount,
    timeSaved,
  };
};
