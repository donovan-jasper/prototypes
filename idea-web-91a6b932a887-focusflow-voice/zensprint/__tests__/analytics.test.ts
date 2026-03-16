import { calculateTotalFocusTime, getMostProductiveHour } from '../lib/analytics';

describe('Analytics', () => {
  it('calculates total focus time', () => {
    const sessions = [
      { duration: 25, completed: true },
      { duration: 45, completed: true },
      { duration: 15, completed: false },
    ];
    expect(calculateTotalFocusTime(sessions)).toBe(70);
  });

  it('identifies most productive hour', () => {
    const sessions = [
      { startTime: '2026-03-16T09:00:00Z', completed: true },
      { startTime: '2026-03-16T09:30:00Z', completed: true },
      { startTime: '2026-03-16T14:00:00Z', completed: true },
    ];
    expect(getMostProductiveHour(sessions)).toBe(9);
  });
});
