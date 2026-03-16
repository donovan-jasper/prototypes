import { useState, useEffect } from 'react';
import { calculateHealthScore } from '../lib/insights';

export const useHealthScore = (habitLogs, totalHabits) => {
  const [healthScore, setHealthScore] = useState(0);

  useEffect(() => {
    if (habitLogs.length > 0 && totalHabits > 0) {
      const score = calculateHealthScore(habitLogs, totalHabits);
      setHealthScore(score);
    }
  }, [habitLogs, totalHabits]);

  return healthScore;
};
