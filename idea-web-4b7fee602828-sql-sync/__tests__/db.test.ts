import { createDatabase, addRow, queryRows, deleteDatabase } from '../lib/db';

describe('Database operations', () => {
  test('creates database with schema', async () => {
    const db = await createDatabase('Clients', [
      { name: 'name', type: 'TEXT' },
      { name: 'email', type: 'TEXT' }
    ]);
    expect(db.id).toBeDefined();
    expect(db.name).toBe('Clients');
  });

  test('adds and retrieves rows', async () => {
    const dbId = 'test-db';
    await addRow(dbId, { name: 'John', email: 'john@example.com' });
    const rows = await queryRows(dbId, 'SELECT * FROM rows');
    expect(rows.length).toBe(1);
    expect(rows[0].name).toBe('John');
  });

  test('deletes database and all rows', async () => {
    const dbId = 'test-db';
    await deleteDatabase(dbId);
    const rows = await queryRows(dbId, 'SELECT * FROM rows');
    expect(rows.length).toBe(0);
  });
});
