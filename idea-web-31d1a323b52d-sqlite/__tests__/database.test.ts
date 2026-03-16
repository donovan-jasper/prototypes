import { createDatabase, insertRow, queryDatabase } from '../lib/database';

describe('Database operations', () => {
  it('creates a table with specified fields', async () => {
    const db = await createDatabase('customers', [
      { name: 'name', type: 'TEXT' },
      { name: 'email', type: 'TEXT' }
    ]);
    expect(db).toBeDefined();
  });

  it('inserts and retrieves rows', async () => {
    await insertRow('customers', { name: 'John', email: 'john@test.com' });
    const rows = await queryDatabase('customers', 'SELECT * FROM customers');
    expect(rows.length).toBe(1);
    expect(rows[0].name).toBe('John');
  });
});
