import { executeQuery } from '../lib/database/query';

describe('Query execution', () => {
  test('executes SELECT query against local snapshot', async () => {
    const result = await executeQuery('snapshot-id', 'SELECT * FROM users LIMIT 5');
    expect(result.rows).toHaveLength(5);
  });

  test('blocks DELETE queries', async () => {
    await expect(
      executeQuery('snapshot-id', 'DELETE FROM users')
    ).rejects.toThrow('Write operations not allowed');
  });
});
