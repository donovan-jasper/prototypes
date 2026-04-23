import DatabaseService from '../src/services/DatabaseService';
import * as SQLite from 'expo-sqlite';

// Mock SQLite
jest.mock('expo-sqlite', () => {
  const mockDb = {
    transaction: jest.fn((callback) => {
      const mockTx = {
        executeSql: jest.fn((sql, params, success, error) => {
          // Simulate successful execution
          const mockResult = {
            rows: {
              length: 0,
              item: jest.fn(() => ({})),
            },
            rowsAffected: 0,
            insertId: 1,
          };

          if (sql.includes('SELECT version FROM schema_version')) {
            mockResult.rows.length = 1;
            mockResult.rows.item = jest.fn(() => ({ version: 1 }));
          }

          if (sql.includes('SELECT * FROM migrations')) {
            mockResult.rows.length = 1;
            mockResult.rows.item = jest.fn(() => ({
              id: 1,
              version: 1,
              description: 'Initial schema setup',
              executed_at: '2023-01-01 00:00:00'
            }));
          }

          if (sql.includes('SELECT * FROM applications')) {
            mockResult.rows.length = 1;
            mockResult.rows.item = jest.fn(() => ({
              id: 1,
              name: 'Test App',
              schema: JSON.stringify({ components: [] }),
              version: 1,
              created_at: '2023-01-01 00:00:00',
              updated_at: '2023-01-01 00:00:00'
            }));
          }

          success(mockTx, mockResult);
        }),
      };
      callback(mockTx);
    }),
  };

  return {
    openDatabase: jest.fn(() => mockDb),
  };
});

describe('DatabaseService', () => {
  let dbService;

  beforeEach(() => {
    dbService = new DatabaseService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should initialize database', async () => {
    await expect(dbService.initDatabase()).resolves.not.toThrow();
  });

  test('should get current schema version', async () => {
    const version = await dbService.getCurrentSchemaVersion();
    expect(version).toBe(1);
  });

  test('should save application', async () => {
    const mockSchema = { components: [] };
    await expect(dbService.saveApplication('Test App', mockSchema)).resolves.not.toThrow();
  });

  test('should update application', async () => {
    const mockSchema = { components: [] };
    await expect(dbService.updateApplication(1, 'Updated App', mockSchema)).resolves.not.toThrow();
  });

  test('should delete application', async () => {
    await expect(dbService.deleteApplication(1)).resolves.not.toThrow();
  });

  test('should get applications', async () => {
    const applications = await dbService.getApplications();
    expect(Array.isArray(applications)).toBe(true);
    expect(applications.length).toBeGreaterThan(0);
    expect(applications[0]).toHaveProperty('id');
    expect(applications[0]).toHaveProperty('name');
    expect(applications[0]).toHaveProperty('schema');
  });

  test('should get migration history', async () => {
    const migrations = await dbService.getMigrationHistory();
    expect(Array.isArray(migrations)).toBe(true);
    expect(migrations.length).toBeGreaterThan(0);
    expect(migrations[0]).toHaveProperty('version');
    expect(migrations[0]).toHaveProperty('description');
    expect(migrations[0]).toHaveProperty('executed_at');
  });
});
