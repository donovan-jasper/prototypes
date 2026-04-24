import { calculateStreak } from '../../lib/habitTracker';

describe('Habit Streak Logic', () => {
  it('should increment streak for consecutive days', () => {
    const dates = ['2023-01-01', '2023-01-02', '2023-01-03'];
    expect(calculateStreak(dates)).toBe(3);
  });

  it('should reset streak on missed day', () => {
    const dates = ['2023-01-01', '2023-01-03'];
    expect(calculateStreak(dates)).toBe(1);
  });
});
