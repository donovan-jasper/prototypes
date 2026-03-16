import { calculateScore, validateDrillCompletion } from '../lib/drills';

describe('calculateScore', () => {
  it('calculates score correctly', () => {
    const targets = [1, 2, 3, 4, 5];
    const userInputs = [1, 2, 3, 4, 5];
    const timeLeft = 30;
    const score = calculateScore(targets, userInputs, timeLeft);
    expect(score.total).toBeGreaterThan(0);
    expect(score.accuracy).toBe(100);
    expect(score.reactionTime).toBeLessThanOrEqual(600);
    expect(score.consistency).toBe(100);
  });

  it('handles incorrect inputs', () => {
    const targets = [1, 2, 3, 4, 5];
    const userInputs = [1, 2, 3, 4, 6];
    const timeLeft = 30;
    const score = calculateScore(targets, userInputs, timeLeft);
    expect(score.accuracy).toBe(80);
    expect(score.consistency).toBeLessThan(100);
  });
});

describe('validateDrillCompletion', () => {
  it('validates correct completion', () => {
    const targets = [1, 2, 3, 4, 5];
    const userInputs = [1, 2, 3, 4, 5];
    expect(validateDrillCompletion(targets, userInputs)).toBe(true);
  });

  it('validates incorrect completion', () => {
    const targets = [1, 2, 3, 4, 5];
    const userInputs = [1, 2, 3, 4, 6];
    expect(validateDrillCompletion(targets, userInputs)).toBe(false);
  });
});
