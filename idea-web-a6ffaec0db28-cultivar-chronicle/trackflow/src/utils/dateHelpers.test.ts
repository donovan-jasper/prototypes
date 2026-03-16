import { isConsecutiveDay, formatStreakDate } from './dateHelpers';

describe('Date Helpers', () => {
  test('detects consecutive days', () => {
    const today = new Date('2026-03-16');
    const yesterday = new Date('2026-03-15');
    expect(isConsecutiveDay(yesterday, today)).toBe(true);
  });

  test('formats date for streak display', () => {
    const date = new Date('2026-03-16');
    expect(formatStreakDate(date)).toBe('Mar 16');
  });
});
