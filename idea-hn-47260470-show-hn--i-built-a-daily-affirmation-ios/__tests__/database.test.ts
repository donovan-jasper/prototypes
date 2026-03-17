import { initDatabase, addGoal, getGoals, logSession, getCurrentStreak, updateStreak } from '../lib/database';

describe('Database', () => {
  beforeAll(async () => {
    await initDatabase();
  });

  test('addGoal creates a new goal', async () => {
    const goal = await addGoal('Test Goal');
    expect(goal).toHaveProperty('id');
    expect(goal.title).toBe('Test Goal');
  });

  test('getGoals returns array', async () => {
    const goals = await getGoals();
    expect(Array.isArray(goals)).toBe(true);
  });

  test('logSession creates a new session', async () => {
    const result = await logSession(1, 3);
    expect(result).toHaveProperty('lastInsertRowId');
  });

  test('getCurrentStreak returns number', async () => {
    const streak = await getCurrentStreak();
    expect(typeof streak).toBe('number');
  });

  test('updateStreak updates streak count', async () => {
    // Add some test sessions
    await logSession(1, 3);
    await logSession(1, 3);

    const streak = await updateStreak();
    expect(streak).toBeGreaterThanOrEqual(1);
  });

  test('streak calculation with grace day', async () => {
    // Clear existing data
    await db.runAsync('DELETE FROM user_sessions');
    await db.runAsync('DELETE FROM streaks');

    // Add sessions with a gap that should use a grace day
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    // Log sessions in reverse chronological order
    await db.runAsync(
      'INSERT INTO user_sessions (timestamp, affirmation_id, mood_rating) VALUES (?, ?, ?)',
      [twoDaysAgo.toISOString(), 1, 3]
    );
    await db.runAsync(
      'INSERT INTO user_sessions (timestamp, affirmation_id, mood_rating) VALUES (?, ?, ?)',
      [today.toISOString(), 1, 3]
    );

    const streak = await getCurrentStreak();
    expect(streak).toBe(2); // Should count as 2 days with one grace day
  });
});
