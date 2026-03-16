import { openDatabase, createSession, getStreak } from '../lib/database';

describe('Database', () => {
  it('creates a session record', async () => {
    const db = await openDatabase();
    const sessionId = await createSession(db, 25, 'default');
    expect(sessionId).toBeGreaterThan(0);
  });

  it('calculates streak correctly', async () => {
    const db = await openDatabase();
    const streak = await getStreak(db);
    expect(streak).toBeGreaterThanOrEqual(0);
  });
});
