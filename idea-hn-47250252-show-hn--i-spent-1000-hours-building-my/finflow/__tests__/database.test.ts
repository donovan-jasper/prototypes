import { initDatabase, addTransaction, getTransactions } from '../lib/database';

describe('Database operations', () => {
  beforeEach(async () => {
    await initDatabase();
  });

  test('adds and retrieves transactions', async () => {
    const transaction = {
      amount: 50.00,
      category: 'Food',
      date: new Date().toISOString(),
      type: 'expense'
    };

    await addTransaction(transaction);
    const transactions = await getTransactions();

    expect(transactions.length).toBeGreaterThan(0);
    expect(transactions[0].amount).toBe(50.00);
  });
});
