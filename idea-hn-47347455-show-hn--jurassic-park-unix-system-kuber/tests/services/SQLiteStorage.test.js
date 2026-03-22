import SQLiteStorage from '../../src/services/SQLiteStorage';

describe('SQLiteStorage', () => {
  it('gets system metrics', async () => {
    const storage = new SQLiteStorage();
    const metrics = await storage.getSystemMetrics();
    expect(metrics).toBeInstanceOf(Array);
  });
});
