import { generateSQL, validateQuery, explainQuery } from '../lib/ai';

describe('AI Query Generation', () => {
  const mockSchema = {
    tables: ['orders'],
    columns: { orders: ['id', 'total', 'date'] },
    types: { orders: { id: 'INTEGER', total: 'REAL', date: 'TEXT' } }
  };

  it('validates correct SQL syntax', () => {
    const validSQL = 'SELECT * FROM users WHERE age > 18';
    expect(validateQuery(validSQL)).toBe(true);
  });

  it('rejects invalid SQL syntax', () => {
    const invalidSQL = 'SELCT * FORM users';
    expect(validateQuery(invalidSQL)).toBe(false);
  });

  it('rejects dangerous SQL operations', () => {
    const dangerousSQL = 'DROP TABLE users';
    expect(validateQuery(dangerousSQL)).toBe(false);
  });

  it('generates offline SQL for common patterns', async () => {
    const sql = await generateSQL('show all orders', mockSchema);
    expect(sql).toContain('SELECT');
    expect(sql).toContain('orders');
  });

  it('generates count queries offline', async () => {
    const sql = await generateSQL('how many orders', mockSchema);
    expect(sql).toContain('COUNT');
  });
});
