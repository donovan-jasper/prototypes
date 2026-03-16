import { initDatabase, resetDatabase } from '../lib/database';

describe('Database', () => {
  test('should initialize database without errors', async () => {
    await expect(initDatabase()).resolves.not.toThrow();
  });

  test('should reset database', async () => {
    await initDatabase();
    await expect(resetDatabase()).resolves.not.toThrow();
  });
});
