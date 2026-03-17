import { createDatabase, addRow, queryRows, deleteDatabase, getDatabaseSchema } from '../lib/db';
import * as SQLite from 'expo-sqlite'; // Import SQLite for mocking

// Mock expo-sqlite
const mockDbInstance = {
  execAsync: jest.fn(() => Promise.resolve()),
  runAsync: jest.fn(() => Promise.resolve({ lastInsertRowId: 1 })),
  getAllAsync: jest.fn(() => Promise.resolve([])),
  closeAsync: jest.fn(() => Promise.resolve()),
};

jest.mock('expo-sqlite', () => ({
  openDatabase: jest.fn(() => mockDbInstance),
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-123'), // Always return a predictable UUID for tests
}));

describe('Database operations', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    // Reset mock implementation for getAllAsync for specific scenarios
    (mockDbInstance.getAllAsync as jest.Mock).mockImplementation((sql) => {
      if (sql.includes('sqlite_master')) {
        // Default mock for schema retrieval
        return Promise.resolve([{ sql: 'CREATE TABLE rows (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT)' }]);
      }
      return Promise.resolve([]); // Default for other queries
    });
  });

  test('creates database with schema and returns unique ID', async () => {
    const dbObject = await createDatabase('Clients', [
      { name: 'name', type: 'TEXT' },
      { name: 'email', type: 'TEXT' }
    ]);
    expect(dbObject.id).toBe('mock-uuid-123'); // Expect the mocked UUID
    expect(dbObject.name).toBe('Clients');
    expect(dbObject.schema).toEqual([
      { name: 'name', type: 'TEXT' },
      { name: 'email', type: 'TEXT' }
    ]);
    expect(SQLite.openDatabase).toHaveBeenCalledWith('mock-uuid-123.db');
    expect(mockDbInstance.execAsync).toHaveBeenCalledWith([{
      sql: 'CREATE TABLE IF NOT EXISTS rows (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT)',
      args: []
    }]);
    expect(mockDbInstance.execAsync).toHaveBeenCalledWith([{
      sql: 'CREATE INDEX IF NOT EXISTS idx_rows_id ON rows (id)',
      args: []
    }]);
  });

  test('adds and retrieves rows', async () => {
    const dbObject = await createDatabase('TestDBForRows', [
      { name: 'name', type: 'TEXT' },
      { name: 'email', type: 'TEXT' }
    ]);
    const dbId = dbObject.id;

    // Mock getAllAsync to return data after addRow
    (mockDbInstance.getAllAsync as jest.Mock).mockResolvedValueOnce([{ id: 1, name: 'John', email: 'john@example.com' }]);

    await addRow(dbId, { name: 'John', email: 'john@example.com' });
    const rows = await queryRows(dbId, 'SELECT * FROM rows');

    expect(SQLite.openDatabase).toHaveBeenCalledWith(`${dbId}.db`);
    expect(mockDbInstance.runAsync).toHaveBeenCalledWith(
      'INSERT INTO rows (name, email) VALUES (?, ?)',
      ['John', 'john@example.com']
    );
    expect(mockDbInstance.getAllAsync).toHaveBeenCalledWith('SELECT * FROM rows');
    expect(rows.length).toBe(1);
    expect(rows[0].name).toBe('John');
  });

  test('deletes database and all rows', async () => {
    const dbObject = await createDatabase('TestDBForDelete', [
      { name: 'name', type: 'TEXT' },
      { name: 'email', type: 'TEXT' }
    ]);
    const dbId = dbObject.id;

    // Mock getAllAsync to return empty array after delete
    (mockDbInstance.getAllAsync as jest.Mock).mockResolvedValueOnce([]);

    await deleteDatabase(dbId);
    const rows = await queryRows(dbId, 'SELECT * FROM rows');

    expect(SQLite.openDatabase).toHaveBeenCalledWith(`${dbId}.db`);
    expect(mockDbInstance.execAsync).toHaveBeenCalledWith([{ sql: 'DROP TABLE IF EXISTS rows', args: [] }]);
    expect(mockDbInstance.closeAsync).toHaveBeenCalled();
    expect(rows.length).toBe(0);
  });
});
