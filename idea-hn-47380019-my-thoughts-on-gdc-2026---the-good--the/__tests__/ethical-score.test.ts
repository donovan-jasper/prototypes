import { calculateEthicalScore, updateScore } from '../lib/ethical-score';

describe('Ethical Score System', () => {
  test('calculates score based on attribution completeness', () => {
    const generations = [
      { hasFullAttribution: true, shared: true },
      { hasFullAttribution: true, shared: false },
      { hasFullAttribution: false, shared: true },
    ];
    
    const score = calculateEthicalScore(generations as any);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  test('increases score for proper attribution', () => {
    const initialScore = 50;
    const newScore = updateScore(initialScore, { hasFullAttribution: true, shared: true });
    expect(newScore).toBeGreaterThan(initialScore);
  });
});
