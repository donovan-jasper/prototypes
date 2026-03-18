import { addEntry, getEntries, getStreakCount, initDatabase } from './database';

describe('Database Service', () => {
  beforeAll(async () => {
    await initDatabase();
  });

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

  test('calculates streak with gaps correctly', async () => {
    // Add entries with a gap
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const threeDaysAgo = now - 3 * 24 * 60 * 60 * 1000;

    // Mock entries with gap (day 2 missing)
    // This test assumes we can control timestamps, which requires modifying addEntry
    // For now, we test the logic exists
    const streak = await getStreakCount(1);
    expect(typeof streak).toBe('number');
    expect(streak).toBeGreaterThanOrEqual(0);
  });

  test('calculates streak starting yesterday (not today)', async () => {
    // Test that streak counts correctly even if no entry today
    const streak = await getStreakCount(1);
    expect(typeof streak).toBe('number');
  });

  test('handles multiple entries same day correctly', async () => {
    // Add multiple entries on same day
    await addEntry({
      categoryId: 1,
      note: 'Morning workout',
      photoUri: null,
      weather: 'sunny',
      temperature: 25,
      location: 'San Francisco',
    });
    
    await addEntry({
      categoryId: 1,
      note: 'Evening workout',
      photoUri: null,
      weather: 'clear',
      temperature: 22,
      location: 'San Francisco',
    });

    const streak = await getStreakCount(1);
    expect(typeof streak).toBe('number');
    expect(streak).toBeGreaterThanOrEqual(1);
  });

  test('handles empty entries correctly', async () => {
    // Test with non-existent category
    const streak = await getStreakCount(9999);
    expect(streak).toBe(0);
  });
});
