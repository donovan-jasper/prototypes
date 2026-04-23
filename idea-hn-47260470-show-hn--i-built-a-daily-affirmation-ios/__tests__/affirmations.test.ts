import { calculateStreak, getGraceDaysUsedThisWeek, getConsecutiveStreakGroups, getLongestStreak } from '../lib/affirmations';
import { initDatabase, getStreakData, updateStreak } from '../lib/database';
import { format, subDays, addDays, startOfWeek, endOfWeek } from 'date-fns';

// Mock the database functions
jest.mock('../lib/database', () => ({
  initDatabase: jest.fn(),
  getStreakData: jest.fn(),
  updateStreak: jest.fn(),
  calculateStreakWithGraceDays: jest.fn(),
}));

describe('Affirmation Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateStreak', () => {
    it('should return streak count of 1 for first session', async () => {
      (getStreakData as jest.Mock).mockResolvedValue([]);
      (updateStreak as jest.Mock).mockResolvedValue(1);

      const today = new Date();
      const streakCount = await calculateStreak(today);

      expect(streakCount).toBe(1);
      expect(updateStreak).toHaveBeenCalledWith(
        format(today, 'yyyy-MM-dd'),
        false,
        1
      );
    });

    it('should increment streak for consecutive days', async () => {
      const yesterday = subDays(new Date(), 1);
      const today = new Date();

      (getStreakData as jest.Mock).mockResolvedValue([
        { date: format(yesterday, 'yyyy-MM-dd'), is_grace_day: 0, streak_count: 5 }
      ]);
      (updateStreak as jest.Mock).mockResolvedValue(6);

      const streakCount = await calculateStreak(today);

      expect(streakCount).toBe(6);
      expect(updateStreak).toHaveBeenCalledWith(
        format(today, 'yyyy-MM-dd'),
        false,
        6
      );
    });

    it('should use grace day when streak is broken but within 3 days', async () => {
      const threeDaysAgo = subDays(new Date(), 3);
      const today = new Date();

      (getStreakData as jest.Mock).mockResolvedValue([
        { date: format(threeDaysAgo, 'yyyy-MM-dd'), is_grace_day: 0, streak_count: 5 }
      ]);
      (updateStreak as jest.Mock).mockResolvedValue(6);

      const streakCount = await calculateStreak(today);

      expect(streakCount).toBe(6);
      expect(updateStreak).toHaveBeenCalledWith(
        format(today, 'yyyy-MM-dd'),
        true,
        6
      );
    });

    it('should reset streak when more than 3 days have passed', async () => {
      const fourDaysAgo = subDays(new Date(), 4);
      const today = new Date();

      (getStreakData as jest.Mock).mockResolvedValue([
        { date: format(fourDaysAgo, 'yyyy-MM-dd'), is_grace_day: 0, streak_count: 5 }
      ]);
      (updateStreak as jest.Mock).mockResolvedValue(1);

      const streakCount = await calculateStreak(today);

      expect(streakCount).toBe(1);
      expect(updateStreak).toHaveBeenCalledWith(
        format(today, 'yyyy-MM-dd'),
        false,
        1
      );
    });
  });

  describe('getGraceDaysUsedThisWeek', () => {
    it('should return 0 when no grace days used this week', async () => {
      const today = new Date();
      const weekStart = startOfWeek(today);
      const weekEnd = endOfWeek(today);

      (getStreakData as jest.Mock).mockResolvedValue([
        { date: format(subDays(weekStart, 1), 'yyyy-MM-dd'), is_grace_day: 1 },
        { date: format(addDays(weekStart, 1), 'yyyy-MM-dd'), is_grace_day: 0 },
      ]);

      const count = await getGraceDaysUsedThisWeek(today);
      expect(count).toBe(0);
    });

    it('should count grace days used this week', async () => {
      const today = new Date();
      const weekStart = startOfWeek(today);
      const weekEnd = endOfWeek(today);

      (getStreakData as jest.Mock).mockResolvedValue([
        { date: format(weekStart, 'yyyy-MM-dd'), is_grace_day: 1 },
        { date: format(addDays(weekStart, 2), 'yyyy-MM-dd'), is_grace_day: 1 },
        { date: format(addDays(weekStart, 4), 'yyyy-MM-dd'), is_grace_day: 0 },
      ]);

      const count = await getGraceDaysUsedThisWeek(today);
      expect(count).toBe(2);
    });

    it('should not count grace days from previous week', async () => {
      const today = new Date();
      const weekStart = startOfWeek(today);
      const weekEnd = endOfWeek(today);

      (getStreakData as jest.Mock).mockResolvedValue([
        { date: format(subDays(weekStart, 1), 'yyyy-MM-dd'), is_grace_day: 1 },
        { date: format(weekStart, 'yyyy-MM-dd'), is_grace_day: 1 },
      ]);

      const count = await getGraceDaysUsedThisWeek(today);
      expect(count).toBe(1);
    });
  });

  describe('getConsecutiveStreakGroups', () => {
    it('should return empty array when no streaks exist', async () => {
      (getStreakData as jest.Mock).mockResolvedValue([]);
      const groups = await getConsecutiveStreakGroups(new Date());
      expect(groups).toEqual([]);
    });

    it('should return single group for consecutive days', async () => {
      const today = new Date();
      const yesterday = subDays(today, 1);
      const twoDaysAgo = subDays(today, 2);

      (getStreakData as jest.Mock).mockResolvedValue([
        { date: format(twoDaysAgo, 'yyyy-MM-dd') },
        { date: format(yesterday, 'yyyy-MM-dd') },
        { date: format(today, 'yyyy-MM-dd') },
      ]);

      const groups = await getConsecutiveStreakGroups(today);
      expect(groups).toEqual([
        {
          start: format(twoDaysAgo, 'yyyy-MM-dd'),
          end: format(today, 'yyyy-MM-dd'),
          length: 3
        }
      ]);
    });

    it('should return multiple groups for non-consecutive streaks', async () => {
      const today = new Date();
      const yesterday = subDays(today, 1);
      const twoDaysAgo = subDays(today, 2);
      const threeDaysAgo = subDays(today, 3);
      const fiveDaysAgo = subDays(today, 5);

      (getStreakData as jest.Mock).mockResolvedValue([
        { date: format(fiveDaysAgo, 'yyyy-MM-dd') },
        { date: format(threeDaysAgo, 'yyyy-MM-dd') },
        { date: format(twoDaysAgo, 'yyyy-MM-dd') },
        { date: format(yesterday, 'yyyy-MM-dd') },
        { date: format(today, 'yyyy-MM-dd') },
      ]);

      const groups = await getConsecutiveStreakGroups(today);
      expect(groups).toEqual([
        {
          start: format(fiveDaysAgo, 'yyyy-MM-dd'),
          end: format(fiveDaysAgo, 'yyyy-MM-dd'),
          length: 1
        },
        {
          start: format(threeDaysAgo, 'yyyy-MM-dd'),
          end: format(today, 'yyyy-MM-dd'),
          length: 4
        }
      ]);
    });
  });

  describe('getLongestStreak', () => {
    it('should return 0 when no streaks exist', async () => {
      (getStreakData as jest.Mock).mockResolvedValue([]);
      const longest = await getLongestStreak();
      expect(longest).toBe(0);
    });

    it('should return length of longest consecutive streak', async () => {
      const today = new Date();
      const yesterday = subDays(today, 1);
      const twoDaysAgo = subDays(today, 2);
      const threeDaysAgo = subDays(today, 3);
      const fiveDaysAgo = subDays(today, 5);

      (getStreakData as jest.Mock).mockResolvedValue([
        { date: format(fiveDaysAgo, 'yyyy-MM-dd') },
        { date: format(threeDaysAgo, 'yyyy-MM-dd') },
        { date: format(twoDaysAgo, 'yyyy-MM-dd') },
        { date: format(yesterday, 'yyyy-MM-dd') },
        { date: format(today, 'yyyy-MM-dd') },
      ]);

      const longest = await getLongestStreak();
      expect(longest).toBe(4);
    });
  });
});
