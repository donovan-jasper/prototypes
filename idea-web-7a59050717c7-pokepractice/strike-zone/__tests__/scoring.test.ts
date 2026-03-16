import { calculateScore, getAccuracyRating } from '../lib/scoring';

describe('Scoring System', () => {
  test('calculates score based on accuracy and speed', () => {
    const result = calculateScore({ hits: 8, total: 10, timeMs: 5000 });
    expect(result.score).toBeGreaterThan(0);
    expect(result.accuracy).toBe(80);
  });

  test('returns accuracy rating', () => {
    expect(getAccuracyRating(95)).toBe('Expert');
    expect(getAccuracyRating(75)).toBe('Good');
    expect(getAccuracyRating(50)).toBe('Fair');
  });
});
