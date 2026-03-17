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

  test('getAffirmationForContext returns an affirmation', async () => {
    const affirmation = await getAffirmationForContext('morning', 2, 5);
    expect(affirmation).toHaveProperty('text');
    expect(affirmation).toHaveProperty('time_of_day');
  });

  test('getAffirmationForContext filters by time of day', async () => {
    const morningAffirmation = await getAffirmationForContext('morning', 2, 5);
    expect(morningAffirmation.time_of_day).toBe('morning');

    const eveningAffirmation = await getAffirmationForContext('evening', 2, 5);
    expect(eveningAffirmation.time_of_day).toBe('evening');
  });

  test('getAffirmationForContext adjusts for low mood', async () => {
    const lowMoodAffirmation = await getAffirmationForContext('morning', 1, 5);
    expect(lowMoodAffirmation.energy_level).toBeLessThanOrEqual(2);
  });
});
