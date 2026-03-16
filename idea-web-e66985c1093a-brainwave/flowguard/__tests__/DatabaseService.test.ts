import { DatabaseService } from '../src/services/DatabaseService';

describe('DatabaseService', () => {
  let db: DatabaseService;

  beforeEach(async () => {
    db = new DatabaseService();
    await db.initialize();
  });

  afterEach(async () => {
    await db.clearAllData();
  });

  test('saves and retrieves session', async () => {
    const session = {
      profileId: 'study',
      startTime: Date.now(),
      endTime: Date.now() + 3600000,
      drowsinessEvents: 2,
    };

    const id = await db.saveSession(session);
    const retrieved = await db.getSession(id);

    expect(retrieved).toMatchObject(session);
  });

  test('calculates weekly stats', async () => {
    await db.saveSession({
      profileId: 'work',
      startTime: Date.now() - 86400000,
      endTime: Date.now() - 82800000,
      drowsinessEvents: 1,
    });

    const stats = await db.getWeeklyStats();
    expect(stats.totalSessions).toBe(1);
    expect(stats.totalDuration).toBeGreaterThan(0);
  });
});
