import { saveSleepSession, getSleepHistory } from '@/lib/storage/database';

describe('Database', () => {
  it('stores sleep session with correct schema', async () => {
    const session = {
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      duration: 480,
      confidence: 0.85,
      notes: 'Test session',
    };
    await saveSleepSession(session);
    const history = await getSleepHistory(7);
    expect(history.length).toBeGreaterThan(0);
  });
});
