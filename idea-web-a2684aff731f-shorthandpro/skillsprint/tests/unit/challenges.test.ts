import { completeChallenge } from '../../src/utils/challenges';

describe('Challenge completion', () => {
  it('awards XP and unlocks next level', () => {
    const result = completeChallenge('typing', 100);
    expect(result.xp).toBe(50);
    expect(result.unlocked).toBe('level2');
  });
});
