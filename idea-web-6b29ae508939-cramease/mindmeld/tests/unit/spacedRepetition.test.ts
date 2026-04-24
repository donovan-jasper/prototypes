import { calculateNextReview } from '../../app/utils/spacedRepetition';

describe('calculateNextReview', () => {
  test('calculates next review date correctly', () => {
    const lastReview = new Date('2023-01-01');
    const recallStrength = 0.8;
    const result = calculateNextReview(lastReview, recallStrength);

    expect(result.nextReviewDate).toBeInstanceOf(Date);
    expect(result.nextReviewDate.getTime()).toBeGreaterThan(lastReview.getTime());
    expect(result.updatedHistory).toHaveProperty('interval');
    expect(result.updatedHistory).toHaveProperty('repetition');
    expect(result.updatedHistory).toHaveProperty('efactor');
  });

  test('handles perfect recall (quality 5)', () => {
    const lastReview = new Date('2023-01-01');
    const recallStrength = 1.0;
    const result = calculateNextReview(lastReview, recallStrength);

    expect(result.updatedHistory.efactor).toBeGreaterThan(2.5);
    expect(result.updatedHistory.repetition).toBeGreaterThan(0);
  });

  test('handles poor recall (quality 0)', () => {
    const lastReview = new Date('2023-01-01');
    const recallStrength = 0.0;
    const result = calculateNextReview(lastReview, recallStrength);

    expect(result.updatedHistory.efactor).toBeLessThan(2.5);
    expect(result.updatedHistory.repetition).toBe(0);
    expect(result.nextReviewDate.getTime()).toBeLessThanOrEqual(lastReview.getTime() + 24 * 60 * 60 * 1000);
  });

  test('uses initial values when no history provided', () => {
    const lastReview = new Date('2023-01-01');
    const recallStrength = 0.5;
    const result = calculateNextReview(lastReview, recallStrength);

    expect(result.updatedHistory.efactor).toBe(2.5);
    expect(result.updatedHistory.repetition).toBe(0);
    expect(result.updatedHistory.interval).toBe(1);
  });

  test('properly updates interval based on repetition', () => {
    const lastReview = new Date('2023-01-01');
    const recallStrength = 0.8;

    // First review
    const firstResult = calculateNextReview(lastReview, recallStrength);
    expect(firstResult.updatedHistory.interval).toBe(1);

    // Second review (with updated history)
    const secondResult = calculateNextReview(
      lastReview,
      recallStrength,
      firstResult.updatedHistory
    );
    expect(secondResult.updatedHistory.interval).toBe(6);

    // Third review
    const thirdResult = calculateNextReview(
      lastReview,
      recallStrength,
      secondResult.updatedHistory
    );
    expect(thirdResult.updatedHistory.interval).toBeGreaterThan(6);
  });
});
