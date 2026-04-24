import { calculateFocusProgress } from '../../app/utils/focusTimer';

describe('Focus Timer', () => {
  it('calculates progress correctly', () => {
    const result = calculateFocusProgress(30, 60); // 30s elapsed, 60s total
    expect(result).toBe(50); // 50% progress
  });
});
