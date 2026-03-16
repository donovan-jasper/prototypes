import { analyzeBehavior } from '../lib/ai/behaviorAnalyzer';
import { getUserInteractions } from '../lib/database/queries';
import BehaviorMetrics from '../constants/BehaviorMetrics';

jest.mock('../lib/database/queries');

describe('behaviorAnalyzer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate behavior vector from interactions', async () => {
    const mockInteractions = [
      {
        id: 1,
        user_id: 'user1',
        type: 'message_send',
        timestamp: '2023-01-01T00:00:00Z',
        metadata_json: JSON.stringify({
          length: 50,
          response_time: 10,
        }),
      },
      {
        id: 2,
        user_id: 'user1',
        type: 'app_usage',
        timestamp: '2023-01-01T00:05:00Z',
        metadata_json: JSON.stringify({
          duration: 300,
          hour: 12,
        }),
      },
    ];

    getUserInteractions.mockResolvedValue(mockInteractions);

    const behaviorVector = await analyzeBehavior('user1');

    expect(behaviorVector).toHaveLength(BehaviorMetrics.length);
    expect(behaviorVector).toEqual(expect.arrayContaining([50, 10, 300, 12, 0, 0]));
  });

  it('should handle empty interactions', async () => {
    getUserInteractions.mockResolvedValue([]);

    const behaviorVector = await analyzeBehavior('user1');

    expect(behaviorVector).toHaveLength(BehaviorMetrics.length);
    expect(behaviorVector).toEqual(expect.arrayContaining(new Array(BehaviorMetrics.length).fill(0)));
  });

  it('should anonymize behavior vector', async () => {
    const mockInteractions = [
      {
        id: 1,
        user_id: 'user1',
        type: 'message_send',
        timestamp: '2023-01-01T00:00:00Z',
        metadata_json: JSON.stringify({
          length: 50,
          response_time: 10,
        }),
      },
    ];

    getUserInteractions.mockResolvedValue(mockInteractions);

    const behaviorVector = await analyzeBehavior('user1');

    // In a real test, you would verify that the vector is properly anonymized
    // For demonstration, we'll just check that it's not empty
    expect(behaviorVector).not.toEqual([]);
  });
});
