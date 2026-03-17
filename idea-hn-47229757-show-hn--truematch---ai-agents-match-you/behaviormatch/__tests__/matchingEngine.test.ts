import { findMatches, generateCompatibilityInsights } from '../lib/ai/matchingEngine';
import { getRemoteBehaviorVector } from '../lib/supabase'; // Import from Supabase

// Mock the entire lib/supabase module, but keep actual implementations for other functions
jest.mock('../lib/supabase', () => ({
  ...jest.requireActual('../lib/supabase'),
  getRemoteBehaviorVector: jest.fn(), // Mock only getRemoteBehaviorVector
}));

describe('matchingEngine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should find matches based on behavior vectors from Supabase', async () => {
    const mockUserVectorData = [0.5, 0.3, 0.7, 0.2];

    const mockPotentialMatches = [
      {
        id: 'user2',
        name: 'User 2',
        age: 25,
      },
      {
        id: 'user3',
        name: 'User 3',
        age: 30,
      },
    ];

    const mockMatchVectorData1 = [0.6, 0.4, 0.5, 0.3];
    const mockMatchVectorData2 = [0.4, 0.2, 0.6, 0.1];

    // Mock the new getRemoteBehaviorVector function
    (getRemoteBehaviorVector as jest.Mock)
      .mockResolvedValueOnce(mockUserVectorData) // For the current user ('user1')
      .mockResolvedValueOnce(mockMatchVectorData1) // For potentialMatch 'user2'
      .mockResolvedValueOnce(mockMatchVectorData2); // For potentialMatch 'user3'

    const matches = await findMatches('user1', mockPotentialMatches);

    expect(getRemoteBehaviorVector).toHaveBeenCalledTimes(3); // 1 for user1, 1 for user2, 1 for user3
    expect(getRemoteBehaviorVector).toHaveBeenCalledWith('user1');
    expect(getRemoteBehaviorVector).toHaveBeenCalledWith('user2');
    expect(getRemoteBehaviorVector).toHaveBeenCalledWith('user3');

    expect(matches).toHaveLength(2);
    expect(matches[0].id).toBe('user2');
    expect(matches[1].id).toBe('user3');
    expect(matches[0].compatibilityScore).toBeGreaterThan(matches[1].compatibilityScore);
  });

  it('should handle missing user vector gracefully', async () => {
    (getRemoteBehaviorVector as jest.Mock).mockResolvedValueOnce(null); // No vector for current user

    const mockPotentialMatches = [
      { id: 'user2', name: 'User 2', age: 25 },
    ];

    const matches = await findMatches('user1', mockPotentialMatches);
    expect(matches).toHaveLength(0);
    expect(getRemoteBehaviorVector).toHaveBeenCalledWith('user1');
    expect(getRemoteBehaviorVector).toHaveBeenCalledTimes(1); // Only tried to get user1's vector
  });

  it('should skip potential matches with missing vectors', async () => {
    const mockUserVectorData = [0.5, 0.3, 0.7, 0.2];
    const mockPotentialMatches = [
      { id: 'user2', name: 'User 2', age: 25 },
      { id: 'user3', name: 'User 3', age: 30 },
    ];
    const mockMatchVectorData2 = [0.6, 0.4, 0.5, 0.3];

    (getRemoteBehaviorVector as jest.Mock)
      .mockResolvedValueOnce(mockUserVectorData) // For current user
      .mockResolvedValueOnce(mockMatchVectorData2) // For user2
      .mockResolvedValueOnce(null); // No vector for user3

    const matches = await findMatches('user1', mockPotentialMatches);
    expect(matches).toHaveLength(1); // Only user2 should be matched
    expect(matches[0].id).toBe('user2');
    expect(getRemoteBehaviorVector).toHaveBeenCalledTimes(3);
    expect(getRemoteBehaviorVector).toHaveBeenCalledWith('user1');
    expect(getRemoteBehaviorVector).toHaveBeenCalledWith('user2');
    expect(getRemoteBehaviorVector).toHaveBeenCalledWith('user3');
  });

  it('should generate compatibility insights', () => {
    const userVector = [0.5, 0.3, 0.7, 0.2];
    const matchVector = [0.6, 0.4, 0.5, 0.3];

    const insights = generateCompatibilityInsights(userVector, matchVector);

    expect(insights).toHaveLength(3);
    expect(insights[0]).toHaveProperty('title');
    expect(insights[0]).toHaveProperty('description');
    expect(insights[0]).toHaveProperty('icon');
    expect(insights[0]).toHaveProperty('details');
  });
});
