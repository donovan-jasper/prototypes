import { calculateSpendingTrend } from '../src/utils/spending';

test('calculates spending trend correctly', () => {
  const transactions = [{ amount: 10 }, { amount: 20 }];
  expect(calculateSpendingTrend(transactions)).toBe(15);
});
