import { trackInteraction, trackMessageSend, trackAppUsage, trackSwipeAction } from '../lib/tracking/interactionTracker';
import { logInteraction } from '../lib/database/queries';

jest.mock('../lib/database/queries');

describe('interactionTracker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should track interaction', async () => {
    logInteraction.mockResolvedValue(1);

    await trackInteraction('user1', 'test_interaction', { key: 'value' });

    expect(logInteraction).toHaveBeenCalledWith('user1', 'test_interaction', { key: 'value' });
  });

  it('should track message send', async () => {
    logInteraction.mockResolvedValue(1);

    const message = {
      text: 'Hello, world!',
      length: 13,
    };

    await trackMessageSend('user1', message);

    expect(logInteraction).toHaveBeenCalledWith(
      'user1',
      'message_send',
      expect.objectContaining({
        length: 13,
        response_time: expect.any(Number),
        timestamp: expect.any(String),
      })
    );
  });

  it('should track app usage', async () => {
    logInteraction.mockResolvedValue(1);

    const session = {
      duration: 300,
    };

    await trackAppUsage('user1', session);

    expect(logInteraction).toHaveBeenCalledWith(
      'user1',
      'app_usage',
      expect.objectContaining({
        duration: 300,
        hour: expect.any(Number),
        timestamp: expect.any(String),
      })
    );
  });

  it('should track swipe action', async () => {
    logInteraction.mockResolvedValue(1);

    const swipe = {
      direction: 'right',
      speed: 1000,
    };

    await trackSwipeAction('user1', swipe);

    expect(logInteraction).toHaveBeenCalledWith(
      'user1',
      'swipe_action',
      expect.objectContaining({
        direction: 'right',
        speed: 1000,
        timestamp: expect.any(String),
      })
    );
  });
});
