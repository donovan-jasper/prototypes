import { calculateStreaks } from '../lib/streaks';
import { getInteractions } from '../lib/database';
import { differenceInDays } from 'date-fns';

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

    expect(streaks[1]).toEqual({
      current: 3,
      longest: 3,
      lastInteraction: today,
      status: 'active',
    });
  });

  it('should handle non-consecutive interactions', async () => {
    const today = new Date();
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const fiveDaysAgo = new Date(today);
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    getInteractions.mockImplementation((friendId) => {
      if (friendId === 1) {
        return Promise.resolve([
          { id: 1, friend_id: 1, type: 'text', timestamp: today.toISOString() },
          { id: 2, friend_id: 1, type: 'call', timestamp: twoDaysAgo.toISOString() },
          { id: 3, friend_id: 1, type: 'hangout', timestamp: fiveDaysAgo.toISOString() },
        ]);
      }
      return Promise.resolve([]);
    });

    const streaks = await calculateStreaks(mockFriends);

    expect(streaks[1]).toEqual({
      current: 2,
      longest: 2,
      lastInteraction: today,
      status: 'active',
    });
  });

  it('should mark streak as at-risk if last interaction was more than 7 days ago', async () => {
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

    expect(streaks[1]).toEqual({
      current: 1,
      longest: 1,
      lastInteraction: eightDaysAgo,
      status: 'at-risk',
    });
  });
});
