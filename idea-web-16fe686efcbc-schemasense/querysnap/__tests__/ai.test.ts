import { generateSQL, validateQuery } from '../lib/ai';

describe('AI Query Generation', () => {
  it('converts natural language to SQL', async () => {
    const schema = { tables: ['orders'], columns: { orders: ['id', 'total', 'date'] } };
    const sql = await generateSQL('Show me orders over $100', schema);
    expect(sql).toContain('SELECT');
    expect(sql).toContain('orders');
    expect(sql).toContain('total > 100');
  });

  it('validates generated SQL syntax', () => {
    const validSQL = 'SELECT * FROM users WHERE age > 18';
    const invalidSQL = 'SELCT * FORM users';
    expect(validateQuery(validSQL)).toBe(true);
    expect(validateQuery(invalidSQL)).toBe(false);
  });
});
