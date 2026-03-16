import { calculateTotalPower, calculateImpedanceLoad } from '../lib/compatibility/calculator';

describe('Power Calculator', () => {
  test('calculates total power for parallel speakers', () => {
    const speakers = [
      { impedance: 8, count: 2 },
      { impedance: 8, count: 2 }
    ];
    const totalImpedance = calculateImpedanceLoad(speakers);
    expect(totalImpedance).toBe(4);
  });

  test('calculates power requirement', () => {
    const speakers = [{ powerHandling: 100, count: 2 }];
    const totalPower = calculateTotalPower(speakers);
    expect(totalPower).toBe(200);
  });
});
