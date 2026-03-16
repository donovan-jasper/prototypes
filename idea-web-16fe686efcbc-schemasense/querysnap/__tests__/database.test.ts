import { createDatabase, executeQuery, getSchema } from '../lib/database';

describe('Database Operations', () => {
  it('creates a new SQLite database', async () => {
    const db = await createDatabase('test.db');
    expect(db).toBeDefined();
  });

  it('executes a SELECT query', async () => {
    const db = await createDatabase('test.db');
    await executeQuery(db, 'CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)');
    await executeQuery(db, "INSERT INTO users (name) VALUES ('Alice')");
    const result = await executeQuery(db, 'SELECT * FROM users');
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].name).toBe('Alice');
  });

  it('extracts schema from database', async () => {
    const db = await createDatabase('test.db');
    await executeQuery(db, 'CREATE TABLE products (id INTEGER, name TEXT, price REAL)');
    const schema = await getSchema(db);
    expect(schema.tables).toContain('products');
    expect(schema.columns.products).toEqual(['id', 'name', 'price']);
  });
});
