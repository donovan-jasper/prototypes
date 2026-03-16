import { validatePower } from '@/lib/validation/power';

describe('Power Handling', () => {
  test('safe when amp power < speaker max', () => {
    expect(validatePower(50, 100)).toBe('compatible');
  });

  test('warns when amp power > speaker max', () => {
    expect(validatePower(150, 100)).toBe('warning');
  });

  test('optimal when amp is 50-80% of speaker rating', () => {
    expect(validatePower(60, 100)).toBe('optimal');
  });
});
