import { calculateInvestmentProjection } from '../src/utils/investment';

test('calculates investment projection correctly', () => {
  const monthlyInvestment = 50;
  const annualReturnRate = 7;
  const years = 10;
  expect(calculateInvestmentProjection(monthlyInvestment, annualReturnRate, years)).toBeCloseTo(10000, 0);
});
