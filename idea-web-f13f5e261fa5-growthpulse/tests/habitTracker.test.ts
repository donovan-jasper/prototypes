import { calculateStreak } from '../lib/habitTracker';

describe('Habit Tracker', () => {
  describe('calculateStreak', () => {
    it('should return 0 for empty dates array', () => {
      const result = calculateStreak([]);
      expect(result).toBe(0);
    });

    it('should return 1 for single date (today)', () => {
      const today = new Date().toISOString().split('T')[0];
      const result = calculateStreak([today]);
      expect(result).toBe(1);
    });

    it('should return 0 for single date (not today)', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const result = calculateStreak([yesterday.toISOString().split('T')[0]]);
      expect(result).toBe(0);
    });

    it('should calculate correct streak for consecutive days', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const dayBefore = new Date(today);
      dayBefore.setDate(today.getDate() - 2);

      const result = calculateStreak([
        today.toISOString().split('T')[0],
        yesterday.toISOString().split('T')[0],
        dayBefore.toISOString().split('T')[0],
      ]);

      expect(result).toBe(3);
    });

    it('should break streak for non-consecutive days', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(today.getDate() - 3);

      const result = calculateStreak([
        today.toISOString().split('T')[0],
        yesterday.toISOString().split('T')[0],
        twoDaysAgo.toISOString().split('T')[0],
      ]);

      expect(result).toBe(2);
    });
  });
});
