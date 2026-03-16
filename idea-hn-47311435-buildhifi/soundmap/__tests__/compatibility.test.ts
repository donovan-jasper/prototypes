import { checkCompatibility, CompatibilityIssue } from '../lib/compatibility/checker';

describe('Compatibility Checker', () => {
  test('detects impedance mismatch', () => {
    const receiver = { minImpedance: 8, maxPower: 100 };
    const speaker = { impedance: 4, powerHandling: 150 };
    const issues = checkCompatibility(receiver, speaker);
    expect(issues).toContainEqual(
      expect.objectContaining({ type: 'impedance', severity: 'warning' })
    );
  });

  test('detects power overload', () => {
    const receiver = { maxPower: 50 };
    const speaker = { powerHandling: 30 };
    const issues = checkCompatibility(receiver, speaker);
    expect(issues).toContainEqual(
      expect.objectContaining({ type: 'power', severity: 'error' })
    );
  });

  test('passes compatible components', () => {
    const receiver = { minImpedance: 4, maxPower: 100 };
    const speaker = { impedance: 8, powerHandling: 120 };
    const issues = checkCompatibility(receiver, speaker);
    expect(issues).toHaveLength(0);
  });
});
