import { calculateNetWorth, calculatePortfolioGains } from '../lib/calculations';

describe('Financial calculations', () => {
  test('calculates net worth correctly', () => {
    const assets = [
      { value: 10000, type: 'cash' },
      { value: 50000, type: 'investment' }
    ];
    const liabilities = [{ value: 20000, type: 'loan' }];
    expect(calculateNetWorth(assets, liabilities)).toBe(40000);
  });

  test('calculates portfolio gains', () => {
    const holdings = [
      { symbol: 'AAPL', shares: 10, costBasis: 150, currentPrice: 180 }
    ];
    const result = calculatePortfolioGains(holdings);
    expect(result.totalGain).toBe(300);
    expect(result.percentGain).toBeCloseTo(20, 1);
  });
});
