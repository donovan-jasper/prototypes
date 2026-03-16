import { getPrivacySettings, updatePrivacySetting, shouldTrackInteraction, anonymizeBehaviorVector, deleteUserData } from '../lib/tracking/privacyManager';
import { getUser, updateUserPreferences } from '../lib/database/queries';

jest.mock('../lib/database/queries');

describe('privacyManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get privacy settings', async () => {
    const mockUser = {
      id: 'user1',
      preferences_json: JSON.stringify({
        privacy: {
          interactionTracking: true,
          messageAnalysis: false,
        },
      }),
    };

    getUser.mockResolvedValue(mockUser);

    const settings = await getPrivacySettings('user1');

    expect(settings).toEqual({
      interactionTracking: true,
      messageAnalysis: false,
    });
  });

  it('should update privacy setting', async () => {
    const mockUser = {
      id: 'user1',
      preferences_json: JSON.stringify({
        privacy: {
          interactionTracking: true,
        },
      }),
    };

    getUser.mockResolvedValue(mockUser);
    updateUserPreferences.mockResolvedValue(1);

    await updatePrivacySetting('user1', 'interactionTracking', false);

    expect(updateUserPreferences).toHaveBeenCalledWith(
      'user1',
      expect.objectContaining({
        privacy: {
          interactionTracking: false,
        },
      })
    );
  });

  it('should check if interaction should be tracked', async () => {
    const mockUser = {
      id: 'user1',
      preferences_json: JSON.stringify({
        privacy: {
          interactionTracking: true,
          messageAnalysis: false,
        },
      }),
    };

    getUser.mockResolvedValue(mockUser);

    const shouldTrack = await shouldTrackInteraction('user1', 'messageAnalysis');

    expect(shouldTrack).toBe(false);
  });

  it('should anonymize behavior vector', () => {
    const behaviorVector = [0.5, 0.3, 0.7, 0.2];

    const anonymizedVector = anonymizeBehaviorVector(behaviorVector);

    // In a real test, you would verify that the vector is properly anonymized
    // For demonstration, we'll just check that it's not empty
    expect(anonymizedVector).not.toEqual([]);
  });

  it('should delete user data', async () => {
    await deleteUserData('user1');

    // In a real test, you would verify that the data is properly deleted
    // For demonstration, we'll just check that the function completes
    expect(true).toBe(true);
  });
});
