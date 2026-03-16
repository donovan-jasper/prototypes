import { saveDrillResult, getUserStats } from '../lib/database';
import { DrillResult } from '../lib/types';

describe('saveDrillResult', () => {
  it('saves a drill result', async () => {
    const result: DrillResult = {
      drillId: '1',
      score: { total: 80, accuracy: 80, reactionTime: 100, consistency: 80 },
      accuracy: 80,
      reactionTime: 100,
      consistency: 80,
      timestamp: '2023-01-01',
    };
    await saveDrillResult(result);
    // Add assertions to verify the result was saved
  });
});

describe('getUserStats', () => {
  it('retrieves user stats', async () => {
    const stats = await getUserStats();
    expect(stats).toHaveProperty('streak');
    expect(stats).toHaveProperty('totalDrills');
    expect(stats).toHaveProperty('totalScore');
  });
});
