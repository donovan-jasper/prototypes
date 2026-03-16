import { calculateDebtPayoffPlan } from '../src/utils/debt';

test('calculates debt payoff plan correctly', () => {
  const debts = [{ amount: 1000, interestRate: 5 }, { amount: 2000, interestRate: 3 }];
  const monthlyIncome = 3000;
  const plan = calculateDebtPayoffPlan(debts, monthlyIncome);
  expect(plan).toHaveLength(2);
  expect(plan[0].monthlyPayment).toBeCloseTo(100, 0);
  expect(plan[1].monthlyPayment).toBeCloseTo(200, 0);
});
