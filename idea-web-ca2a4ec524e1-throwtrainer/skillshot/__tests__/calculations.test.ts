import { calculateAccuracy, detectPersonalRecord, calculateStreak } from '../src/utils/calculations';

describe('calculations', () => {
  it('should calculate accuracy percentage', () => {
    expect(calculateAccuracy(5, 10)).toBe(50);
    expect(calculateAccuracy(3, 5)).toBe(60);
    expect(calculateAccuracy(0, 10)).toBe(0);
  });

  it('should detect personal record', () => {
    const currentStats = { maxSpeed: 10, maxAngle: 45 };
    const newAttempt1 = { speed: 15, angle: 30 };
    const newAttempt2 = { speed: 5, angle: 60 };

    expect(detectPersonalRecord(currentStats, newAttempt1)).toBe(true);
    expect(detectPersonalRecord(currentStats, newAttempt2)).toBe(true);
  });

  it('should calculate streak', () => {
    const sessions = [
      { id: 1, date: '2023-01-01', activityType: 'basketball' },
      { id: 2, date: '2023-01-02', activityType: 'basketball' },
      { id: 3, date: '2023-01-03', activityType: 'basketball' },
    ];

    expect(calculateStreak(sessions)).toBe(3);
  });
});
