import { openDatabase, addExpense, getExpenses, getBalance } from '../lib/database';

describe('Database Operations', () => {
  beforeEach(async () => {
    await openDatabase(':memory:');
  });

  test('adds expense and retrieves it', async () => {
    const expense = {
      amount: 50,
      description: 'Groceries',
      category: 'Food',
      paidBy: 'user1',
      splitWith: ['user1', 'user2'],
      date: new Date().toISOString(),
    };

    const id = await addExpense(expense);
    const expenses = await getExpenses();

    expect(expenses).toHaveLength(1);
    expect(expenses[0].description).toBe('Groceries');
  });

  test('calculates balance correctly', async () => {
    await addExpense({ amount: 100, paidBy: 'user1', splitWith: ['user1', 'user2'] });
    await addExpense({ amount: 60, paidBy: 'user2', splitWith: ['user1', 'user2'] });

    const balance = await getBalance('user1', 'user2');
    expect(balance).toBe(20); // user1 paid 100, owes 50; user2 paid 60, owes 50 → user2 owes user1 20
  });
});
