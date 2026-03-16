import { savePerformance, getRecentScores } from '../lib/database';

describe('Database Operations', () => {
  test('saves performance record', async () => {
    const record = {
      challengeId: 'tap-timing',
      score: 850,
      accuracy: 85,
      timestamp: Date.now()
    };
    await expect(savePerformance(record)).resolves.not.toThrow();
  });

  test('retrieves recent scores', async () => {
    const scores = await getRecentScores('tap-timing', 7);
    expect(Array.isArray(scores)).toBe(true);
  });
});
