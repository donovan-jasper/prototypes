import { createTable, insertRows, query } from '../lib/database';

describe('Database', () => {
  it('creates table with correct schema', async () => {
    const schema = { name: 'TEXT', age: 'INTEGER' };
    await createTable('users', schema);
    const result = await query('SELECT sql FROM sqlite_master WHERE name="users"');
    expect(result.rows[0].sql).toContain('name TEXT');
  });

  it('inserts and retrieves rows', async () => {
    await insertRows('users', [{ name: 'Alice', age: 30 }]);
    const result = await query('SELECT * FROM users WHERE name="Alice"');
    expect(result.rows[0].age).toBe(30);
  });
});
