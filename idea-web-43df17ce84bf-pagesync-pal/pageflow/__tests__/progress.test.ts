import { calculateProgress, convertProgress, estimateTimeRemaining } from '../lib/progress';

describe('Progress calculations', () => {
  test('calculates percentage from page numbers', () => {
    expect(calculateProgress(150, 300, 'page')).toBe(50);
  });

  test('converts page progress to audiobook timestamp', () => {
    const result = convertProgress(150, 300, 'page', 'audiobook', 600);
    expect(result).toBe(300); // 50% of 600 minutes
  });

  test('estimates time remaining for audiobook', () => {
    const result = estimateTimeRemaining(300, 600, 'audiobook');
    expect(result).toBe(300); // 300 minutes left
  });
});
