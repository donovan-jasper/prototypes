import { calculateFriendshipScore, getAnalyticsSummary, getFriendsNeedingAttention, getLongestStreaks } from '../lib/analytics';
import { getInteractions, getChallenges } from '../lib/database';

jest.mock('../lib/database', () => ({
  getInteractions: jest.fn(),
  getChallenges: jest.fn(),
}));

describe('Friendship score calculation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should calculate score for new friend', async () => {
    getInteractions.mockResolvedValue([]);
    getChallenges.mockResolvedValue([]);

    const { score, status } = await calculateFriendshipScore(1);

    expect(score).toBe(0);
    expect(status).toBe('fading');
  });

  it('should calculate score for active friend', async () => {
    const interactions = Array(16).fill({ id: 1, friend_id: 1, type: 'text', timestamp: new Date().toISOString() });
    getInteractions.mockResolvedValue(interactions);
    getChallenges.mockResolvedValue([
      { id: 1, friend_id: 1, challenge_type: 'Send a text', status: 'completed' },
      { id: 2, friend_id: 1, challenge_type: 'Share a meme', status: 'completed' },
    ]);

    const { score, status } = await calculateFriendshipScore(1);

    expect(score).toBeGreaterThanOrEqual(80);
    expect(status).toBe('thriving');
  });

  it('should calculate score for friend needing attention', async () => {
    const interactions = Array(4).fill({ id: 1, friend_id: 1, type: 'text', timestamp: new Date().toISOString() });
    getInteractions.mockResolvedValue(interactions);
    getChallenges.mockResolvedValue([]);

    const { score, status } = await calculateFriendshipScore(1);

    expect(score).toBeLessThan(40);
    expect(status).toBe('fading');
  });
});

describe('Analytics summary', () => {
  const mockFriends = [
    { id: 1, name: 'Friend 1' },
    { id: 2, name: 'Friend 2' },
  ];

  it('should calculate summary statistics', async () => {
    getInteractions.mockResolvedValue([
      { id: 1, friend_id: 1, type: 'text', timestamp: new Date().toISOString() },
      { id: 2, friend_id: 1, type: 'call', timestamp: new Date().toISOString() },
    ]);

    const summary = await getAnalyticsSummary(mockFriends);

    expect(summary.totalFriends).toBe(2);
    expect(summary.averageStreak).toBeGreaterThan(0);
    expect(summary.interactionsThisMonth).toBe(2);
  });
});

describe('Friends needing attention', () => {
  const mockFriends = [
    { id: 1, name: 'Friend 1' },
    { id: 2, name: 'Friend 2' },
  ];

  it('should return friends with low scores', async () => {
    getInteractions.mockResolvedValue([]);
    getChallenges.mockResolvedValue([]);

    const friendsNeedingAttention = await getFriendsNeedingAttention(mockFriends);

    expect(friendsNeedingAttention.length).toBe(2);
    expect(friendsNeedingAttention[0].score).toBeLessThan(40);
  });
});

describe('Longest streaks', () => {
  const mockFriends = [
    { id: 1, name: 'Friend 1' },
    { id: 2, name: 'Friend 2' },
  ];

  it('should return friends with longest streaks', async () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    getInteractions.mockImplementation((friendId) => {
      if (friendId === 1) {
        return Promise.resolve([
          { id: 1, friend_id: 1, type: 'text', timestamp: today.toISOString() },
          { id: 2, friend_id: 1, type: 'call', timestamp: yesterday.toISOString() },
        ]);
      }
      return Promise.resolve([
        { id: 1, friend_id: 2, type: 'text', timestamp: today.toISOString() },
      ]);
    });

    const longestStreaks = await getLongestStreaks(mockFriends);

    expect(longestStreaks.length).toBe(2);
    expect(longestStreaks[0].streak).toBeGreaterThanOrEqual(longestStreaks[1].streak);
  });
});
