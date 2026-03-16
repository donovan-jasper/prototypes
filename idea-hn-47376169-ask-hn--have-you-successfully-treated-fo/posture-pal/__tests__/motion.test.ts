import { detectPosture, isHoldingCorrectly } from '../lib/motion';

describe('Motion Detection', () => {
  test('detects correct posture from accelerometer data', () => {
    const mockData = { x: 0, y: 9.8, z: 0 };
    const result = detectPosture(mockData);
    expect(result.isCorrect).toBe(true);
  });

  test('validates hold duration', () => {
    const isValid = isHoldingCorrectly(5000, 5000);
    expect(isValid).toBe(true);
  });
});
