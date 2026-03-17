import { initDatabase, addGoal, getGoals, logSession, getCurrentStreak, updateStreak, getGraceDaysUsedThisWeek } from '../lib/database';
import { format, startOfWeek, endOfWeek, subDays } from 'date-fns';

describe('Database', () => {
  beforeAll(async () => {
    await initDatabase();
  });

  beforeEach(async () => {
    // Clear all tables before each test
    await db.runAsync('DELETE FROM user_sessions');
    await db.runAsync('DELETE FROM streaks');
    await db.runAsync('DELETE FROM goals');
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
    // Add sessions with a gap that should use a grace day
    const today = new Date();
    const yesterday = subDays(today, 1);
    const twoDaysAgo = subDays(today, 2);

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

  test('grace days reset weekly', async () => {
    // Add a grace day from last week
    const lastWeek = subDays(new Date(), 7);
    await db.runAsync(
      'INSERT INTO streaks (date, is_grace_day) VALUES (?, ?)',
      [format(lastWeek, 'yyyy-MM-dd'), 1]
    );

    // Add a grace day from this week
    const thisWeek = subDays(new Date(), 1);
    await db.runAsync(
      'INSERT INTO streaks (date, is_grace_day) VALUES (?, ?)',
      [format(thisWeek, 'yyyy-MM-dd'), 1]
    );

    const graceDays = await getGraceDaysUsedThisWeek();
    expect(graceDays).toBe(1); // Only counts this week's grace day
  });

  test('grace days limit per week', async () => {
    // Add two grace days this week
    const today = new Date();
    const yesterday = subDays(today, 1);

    await db.runAsync(
      'INSERT INTO streaks (date, is_grace_day) VALUES (?, ?)',
      [format(yesterday, 'yyyy-MM-dd'), 1]
    );

    await db.runAsync(
      'INSERT INTO streaks (date, is_grace_day) VALUES (?, ?)',
      [format(today, 'yyyy-MM-dd'), 1]
    );

    // Try to use a third grace day
    const result = await updateStreak();
    expect(result).toBe(1); // Should not allow third grace day
  });
});
