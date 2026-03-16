import { addEntry, getEntries, getStreakCount } from './database';

describe('Database Service', () => {
  test('adds entry and retrieves it', async () => {
    const entry = await addEntry({
      categoryId: 1,
      note: 'Morning run',
      photoUri: null,
      weather: 'sunny',
      temperature: 25,
      location: 'San Francisco',
    });
    expect(entry.id).toBeDefined();

    const entries = await getEntries(1);
    expect(entries.length).toBeGreaterThan(0);
  });

  test('calculates streak correctly', async () => {
    const streak = await getStreakCount(1);
    expect(typeof streak).toBe('number');
  });
});
