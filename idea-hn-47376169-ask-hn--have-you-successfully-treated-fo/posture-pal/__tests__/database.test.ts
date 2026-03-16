import { initDatabase, logPainEntry, getStreakCount } from '../lib/database';

describe('Database Operations', () => {
  beforeAll(async () => {
    await initDatabase();
  });

  test('logs pain entry successfully', async () => {
    const entry = await logPainEntry(3, ['neck', 'shoulders']);
    expect(entry).toBeDefined();
  });

  test('calculates streak correctly', async () => {
    const streak = await getStreakCount();
    expect(streak).toBeGreaterThanOrEqual(0);
  });
});
