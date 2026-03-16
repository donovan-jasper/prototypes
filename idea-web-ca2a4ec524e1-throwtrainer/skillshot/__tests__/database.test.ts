import { initDatabase, createSession, logAttempt, getStats, getPersonalRecords } from '../src/services/database';

describe('database', () => {
  beforeAll(() => {
    initDatabase();
  });

  it('should create a session', async () => {
    const sessionId = await createSession('basketball');
    expect(sessionId).toBeDefined();
  });

  it('should log an attempt', async () => {
    const sessionId = await createSession('basketball');
    const attemptId = await logAttempt(sessionId, 10, 45, true);
    expect(attemptId).toBeDefined();
  });

  it('should get stats', async () => {
    const sessionId = await createSession('basketball');
    await logAttempt(sessionId, 10, 45, true);
    await logAttempt(sessionId, 15, 30, false);

    const stats = await getStats();
    expect(stats.totalShots).toBe(2);
    expect(stats.highestAccuracy).toBe(50);
  });

  it('should get personal records', async () => {
    const sessionId = await createSession('basketball');
    await logAttempt(sessionId, 10, 45, true);
    await logAttempt(sessionId, 15, 30, false);

    const records = await getPersonalRecords();
    expect(records.maxSpeed).toBe(15);
    expect(records.maxAngle).toBe(45);
  });
});
