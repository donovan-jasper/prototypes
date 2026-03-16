import { findMatches, generateCompatibilityInsights } from '../lib/ai/matchingEngine';
import { getBehaviorVector } from '../lib/database/queries';

jest.mock('../lib/database/queries');

describe('matchingEngine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should find matches based on behavior vectors', async () => {
    const mockUserVector = {
      id: 1,
      user_id: 'user1',
      vector_data: [0.5, 0.3, 0.7, 0.2],
      updated_at: '2023-01-01T00:00:00Z',
    };

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

    const mockMatchVectors = [
      {
        id: 2,
        user_id: 'user2',
        vector_data: [0.6, 0.4, 0.5, 0.3],
        updated_at: '2023-01-01T00:00:00Z',
      },
      {
        id: 3,
        user_id: 'user3',
        vector_data: [0.4, 0.2, 0.6, 0.1],
        updated_at: '2023-01-01T00:00:00Z',
      },
    ];

    getBehaviorVector
      .mockResolvedValueOnce(mockUserVector)
      .mockResolvedValueOnce(mockMatchVectors[0])
      .mockResolvedValueOnce(mockMatchVectors[1]);

    const matches = await findMatches('user1', mockPotentialMatches);

    expect(matches).toHaveLength(2);
    expect(matches[0].id).toBe('user2');
    expect(matches[1].id).toBe('user3');
    expect(matches[0].compatibilityScore).toBeGreaterThan(matches[1].compatibilityScore);
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
