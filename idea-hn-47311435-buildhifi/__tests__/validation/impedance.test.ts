import { validateImpedance } from '@/lib/validation/impedance';

describe('Impedance Validation', () => {
  test('matches 8Ω speaker to 8Ω amp output', () => {
    expect(validateImpedance(8, 8)).toBe('compatible');
  });

  test('warns on 4Ω speaker with 8Ω-only amp', () => {
    expect(validateImpedance(4, 8, { minOhms: 8 })).toBe('warning');
  });

  test('blocks 2Ω speaker on 8Ω-only amp', () => {
    expect(validateImpedance(2, 8, { minOhms: 8 })).toBe('incompatible');
  });
});
