import { executeQuery, optimizeQuery } from '../lib/query-engine';

describe('Query Engine', () => {
  it('executes SELECT query and returns results', async () => {
    const result = await executeQuery('SELECT * FROM test LIMIT 10');
    expect(result.rows).toBeDefined();
    expect(result.columns).toBeDefined();
  });

  it('optimizes query with indexes', () => {
    const query = 'SELECT * FROM users WHERE email = "test@example.com"';
    const optimized = optimizeQuery(query);
    expect(optimized).toContain('INDEX');
  });
});
