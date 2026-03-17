import { calculateCompatibilityScore, findCommonInterests } from '../../utils/compatibility';

describe('Compatibility Algorithm', () => {
  test('calculates high score for matching interests', () => {
    const user1 = { interests: ['cooking', 'gardening', 'reading'], age: 70, lat: 40.7128, lon: -74.0060 };
    const user2 = { interests: ['cooking', 'reading', 'hiking'], age: 25, lat: 40.7200, lon: -74.0100 };
    const score = calculateCompatibilityScore(user1, user2);
    expect(score).toBeGreaterThan(60);
  });

  test('finds common interests correctly', () => {
    const interests1 = ['cooking', 'gardening', 'reading'];
    const interests2 = ['cooking', 'reading', 'hiking'];
    const common = findCommonInterests(interests1, interests2);
    expect(common).toEqual(['cooking', 'reading']);
  });

  test('returns low score for no common interests', () => {
    const user1 = { interests: ['cooking'], age: 70, lat: 40.7128, lon: -74.0060 };
    const user2 = { interests: ['gaming'], age: 25, lat: 40.7200, lon: -74.0100 };
    const score = calculateCompatibilityScore(user1, user2);
    expect(score).toBeLessThan(30);
  });
});
