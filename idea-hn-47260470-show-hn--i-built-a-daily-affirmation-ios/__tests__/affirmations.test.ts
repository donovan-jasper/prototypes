import { getAffirmationForContext, calculateStreak, shouldShowMilestone } from '../lib/affirmations';

describe('Affirmations', () => {
  test('shouldShowMilestone returns true for milestone days', () => {
    expect(shouldShowMilestone(7)).toBe(true);
    expect(shouldShowMilestone(30)).toBe(true);
    expect(shouldShowMilestone(100)).toBe(true);
    expect(shouldShowMilestone(365)).toBe(true);
    expect(shouldShowMilestone(15)).toBe(false);
  });

  test('calculateStreak returns 0 for empty sessions', async () => {
    const streak = await calculateStreak([]);
    expect(streak).toBe(0);
  });
});
