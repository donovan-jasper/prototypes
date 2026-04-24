import { calculateTradeProfit } from '../utils/trade';

test('calculates profit correctly', () => {
  expect(calculateTradeProfit(10, 20)).toBe(10);
});
