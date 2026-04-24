import { calculateNextReview } from '../../app/utils/spacedRepetition';

test('calculates next review date correctly', () => {
  const lastReview = new Date('2023-01-01');
  const recallStrength = 0.8;
  const nextReview = calculateNextReview(lastReview, recallStrength);
  expect(nextReview).toBeInstanceOf(Date);
});
