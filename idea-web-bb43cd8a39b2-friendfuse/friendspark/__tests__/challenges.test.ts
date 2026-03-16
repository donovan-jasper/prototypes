import { getAvailableChallenges, startChallenge } from '../lib/challenges';
import { getChallenges, addChallenge } from '../lib/database';

jest.mock('../lib/database', () => ({
  getChallenges: jest.fn(),
  addChallenge: jest.fn(),
}));

describe('Challenge management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return available challenges for free tier', async () => {
    getChallenges.mockResolvedValue([]);

    const challenges = await getAvailableChallenges(1, 'free');

    expect(challenges.length).toBeGreaterThan(0);
    expect(challenges.some(c => c.premium)).toBe(false);
  });

  it('should return available challenges for pro tier', async () => {
    getChallenges.mockResolvedValue([]);

    const challenges = await getAvailableChallenges(1, 'pro');

    expect(challenges.length).toBeGreaterThan(0);
    expect(challenges.some(c => c.premium)).toBe(true);
  });

  it('should not return already started challenges', async () => {
    getChallenges.mockResolvedValue([
      { id: 1, friend_id: 1, challenge_type: 'Send a text', status: 'active' },
    ]);

    const challenges = await getAvailableChallenges(1, 'free');

    expect(challenges.some(c => c.title === 'Send a text')).toBe(false);
  });

  it('should start a new challenge', async () => {
    addChallenge.mockResolvedValue(1);

    const challengeId = await startChallenge(1, 'Send a text');

    expect(challengeId).toBe(1);
    expect(addChallenge).toHaveBeenCalledWith({
      friend_id: 1,
      challenge_type: 'Send a text',
      status: 'active',
    });
  });
});
