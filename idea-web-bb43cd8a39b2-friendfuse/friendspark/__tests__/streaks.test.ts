import { calculateStreaks } from '../lib/streaks';
import { getInteractions } from '../lib/database';
import { startOfDay } from 'date-fns';

jest.mock('../lib/database', () => ({
  getInteractions: jest.fn(),
}));

describe('Streak calculation', () => {
  const mockFriends = [
    { id: 1, name: 'Friend 1' },
    { id: 2, name: 'Friend 2' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return null for friends with no interactions', async () => {
    getInteractions.mockResolvedValue([]);

    const streaks = await calculateStreaks(mockFriends);

    expect(streaks).toEqual({
      1: null,
      2: null,
    });
  });

  it('should handle same-day duplicates correctly', async () => {
    const today = new Date();
    const todayMorning = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0, 0);
    const todayEvening = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 0, 0);

    getInteractions.mockImplementation((friendId) => {
      if (friendId === 1) {
        return Promise.resolve([
          { id: 1, friend_id: 1, type: 'text', timestamp: todayMorning.toISOString() },
          { id: 2, friend_id: 1, type: 'call', timestamp: todayEvening.toISOString() },
        ]);
      }
      return Promise.resolve([]);
    });

    const streaks = await calculateStreaks(mockFriends);

    expect(streaks[1].current).toBe(1);
  });

  it('should calculate correct streak for consecutive days', async () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    getInteractions.mockImplementation((friendId) => {
      if (friendId === 1) {
        return Promise.resolve([
          { id: 1, friend_id: 1, type: 'text', timestamp: today.toISOString() },
          { id: 2, friend_id: 1, type: 'call', timestamp: yesterday.toISOString() },
          { id: 3, friend_id: 1, type: 'hangout', timestamp: twoDaysAgo.toISOString() },
        ]);
      }
      return Promise.resolve([]);
    });

    const streaks = await calculateStreaks(mockFriends);

    expect(streaks[1].current).toBe(3);
    expect(streaks[1].longest).toBe(3);
    expect(streaks[1].status).toBe('active');
  });

  it('should find longest streak in history even when current is broken', async () => {
    const today = new Date();
    const tenDaysAgo = new Date(today);
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    const elevenDaysAgo = new Date(today);
    elevenDaysAgo.setDate(elevenDaysAgo.getDate() - 11);
    const twelveDaysAgo = new Date(today);
    twelveDaysAgo.setDate(twelveDaysAgo.getDate() - 12);
    const thirteenDaysAgo = new Date(today);
    thirteenDaysAgo.setDate(thirteenDaysAgo.getDate() - 13);

    getInteractions.mockImplementation((friendId) => {
      if (friendId === 1) {
        return Promise.resolve([
          { id: 1, friend_id: 1, type: 'text', timestamp: tenDaysAgo.toISOString() },
          { id: 2, friend_id: 1, type: 'call', timestamp: elevenDaysAgo.toISOString() },
          { id: 3, friend_id: 1, type: 'hangout', timestamp: twelveDaysAgo.toISOString() },
          { id: 4, friend_id: 1, type: 'text', timestamp: thirteenDaysAgo.toISOString() },
        ]);
      }
      return Promise.resolve([]);
    });

    const streaks = await calculateStreaks(mockFriends);

    expect(streaks[1].current).toBe(0);
    expect(streaks[1].longest).toBe(4);
    expect(streaks[1].status).toBe('broken');
  });

  it('should mark streak as at-risk if last interaction was 5-7 days ago', async () => {
    const today = new Date();
    const sixDaysAgo = new Date(today);
    sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);

    getInteractions.mockImplementation((friendId) => {
      if (friendId === 1) {
        return Promise.resolve([
          { id: 1, friend_id: 1, type: 'text', timestamp: sixDaysAgo.toISOString() },
        ]);
      }
      return Promise.resolve([]);
    });

    const streaks = await calculateStreaks(mockFriends);

    expect(streaks[1].status).toBe('at-risk');
  });

  it('should mark streak as broken if last interaction was >7 days ago and current streak is 0', async () => {
    const today = new Date();
    const eightDaysAgo = new Date(today);
    eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);

    getInteractions.mockImplementation((friendId) => {
      if (friendId === 1) {
        return Promise.resolve([
          { id: 1, friend_id: 1, type: 'text', timestamp: eightDaysAgo.toISOString() },
        ]);
      }
      return Promise.resolve([]);
    });

    const streaks = await calculateStreaks(mockFriends);

    expect(streaks[1].current).toBe(0);
    expect(streaks[1].status).toBe('broken');
  });

  it('should calculate current streak from yesterday if no interaction today', async () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    getInteractions.mockImplementation((friendId) => {
      if (friendId === 1) {
        return Promise.resolve([
          { id: 1, friend_id: 1, type: 'text', timestamp: yesterday.toISOString() },
          { id: 2, friend_id: 1, type: 'call', timestamp: twoDaysAgo.toISOString() },
        ]);
      }
      return Promise.resolve([]);
    });

    const streaks = await calculateStreaks(mockFriends);

    expect(streaks[1].current).toBe(2);
    expect(streaks[1].status).toBe('active');
  });

  it('should handle non-consecutive interactions and find longest historical streak', async () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const fiveDaysAgo = new Date(today);
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    const sixDaysAgo = new Date(today);
    sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    getInteractions.mockImplementation((friendId) => {
      if (friendId === 1) {
        return Promise.resolve([
          { id: 1, friend_id: 1, type: 'text', timestamp: today.toISOString() },
          { id: 2, friend_id: 1, type: 'call', timestamp: yesterday.toISOString() },
          { id: 3, friend_id: 1, type: 'hangout', timestamp: fiveDaysAgo.toISOString() },
          { id: 4, friend_id: 1, type: 'text', timestamp: sixDaysAgo.toISOString() },
          { id: 5, friend_id: 1, type: 'call', timestamp: sevenDaysAgo.toISOString() },
        ]);
      }
      return Promise.resolve([]);
    });

    const streaks = await calculateStreaks(mockFriends);

    expect(streaks[1].current).toBe(2);
    expect(streaks[1].longest).toBe(3);
    expect(streaks[1].status).toBe('active');
  });
});
