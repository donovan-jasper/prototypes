import { calculateHealthScore, findCorrelations } from '../lib/insights';

describe('Health Insights', () => {
  test('should calculate health score from habit data', () => {
    const habitLogs = [
      { habitId: 1, completed: true, date: '2026-03-15' },
      { habitId: 2, completed: false, date: '2026-03-15' },
      { habitId: 3, completed: true, date: '2026-03-15' },
    ];
    const score = calculateHealthScore(habitLogs, 3);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  test('should detect correlations between habits', () => {
    const sleepData = [7, 5, 8, 6, 5];
    const exerciseData = [1, 0, 1, 1, 0];
    const correlation = findCorrelations(sleepData, exerciseData);
    expect(correlation).toHaveProperty('strength');
    expect(correlation).toHaveProperty('insight');
  });
});
