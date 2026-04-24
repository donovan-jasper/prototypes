import { traceMoney } from '../lib/trace';

describe('Deterministic Trace Engine', () => {
  it('identifies all transactions between two balances', () => {
    const transactions = [
      { id: '1', date: new Date('2026-01-01'), amount: 1000, type: 'deposit', payee: 'Bank' },
      { id: '2', date: new Date('2026-01-05'), amount: -200, type: 'withdrawal', payee: 'Store A' },
      { id: '3', date: new Date('2026-01-10'), amount: -300, type: 'withdrawal', payee: 'Store B' },
    ];
    const result = traceMoney(0, 500, transactions);
    expect(result.explained).toBe(true);
    expect(result.endingBalance).toBe(500);
  });

  it('flags unexplained balance changes', () => {
    const transactions = [
      { id: '1', date: new Date('2026-01-01'), amount: 1000, type: 'deposit', payee: 'Bank' },
    ];
    const result = traceMoney(0, 1500, transactions);
    expect(result.explained).toBe(false);
    expect(result.gap).toBe(500);
  });

  it('handles transaction fees correctly', () => {
    const transactions = [
      { id: '1', date: new Date('2026-01-01'), amount: 1000, type: 'deposit', payee: 'Bank' },
      { id: '2', date: new Date('2026-01-05'), amount: -200, type: 'withdrawal', payee: 'Store A', fee: 1 },
      { id: '3', date: new Date('2026-01-10'), amount: -300, type: 'withdrawal', payee: 'Store B', fee: 2 },
    ];
    const result = traceMoney(0, 497, transactions);
    expect(result.explained).toBe(true);
    expect(result.gap).toBe(0);
  });

  it('handles overall fee correctly', () => {
    const transactions = [
      { id: '1', date: new Date('2026-01-01'), amount: 1000, type: 'deposit', payee: 'Bank' },
      { id: '2', date: new Date('2026-01-05'), amount: -200, type: 'withdrawal', payee: 'Store A' },
      { id: '3', date: new Date('2026-01-10'), amount: -300, type: 'withdrawal', payee: 'Store B' },
    ];
    const result = traceMoney(0, 497, transactions, 0.01, 3);
    expect(result.explained).toBe(true);
    expect(result.gap).toBe(0);
  });

  it('flags when fees cause unexplained balance', () => {
    const transactions = [
      { id: '1', date: new Date('2026-01-01'), amount: 1000, type: 'deposit', payee: 'Bank' },
      { id: '2', date: new Date('2026-01-05'), amount: -200, type: 'withdrawal', payee: 'Store A', fee: 1 },
    ];
    const result = traceMoney(0, 800, transactions);
    expect(result.explained).toBe(false);
    expect(result.gap).toBe(799);
  });
});
