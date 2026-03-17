import * as SQLite from 'expo-sqlite';
import { format, isSameDay, subDays, startOfWeek, addDays } from 'date-fns';

let db: SQLite.SQLiteDatabase;

export const initDatabase = async () => {
  db = await SQLite.openDatabaseAsync('motimorph.db');

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS affirmations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT,
      category TEXT,
      time_of_day TEXT,
      energy_level INTEGER
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS user_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      affirmation_id INTEGER,
      mood_rating INTEGER,
      FOREIGN KEY (affirmation_id) REFERENCES affirmations (id)
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_active INTEGER DEFAULT 1
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS streaks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT,
      is_grace_day INTEGER DEFAULT 0,
      UNIQUE(date)
    );
  `);

  // Create index for faster date lookups
  await db.execAsync('CREATE INDEX IF NOT EXISTS idx_streaks_date ON streaks(date)');
};

export const seedAffirmations = async (affirmations: any[]) => {
  if (!db) await initDatabase();

  // Check if we already have affirmations
  const count = await db.getFirstAsync('SELECT COUNT(*) as count FROM affirmations');
  if (count.count > 0) return;

  for (const affirmation of affirmations) {
    await db.runAsync(
      'INSERT INTO affirmations (text, category, time_of_day, energy_level) VALUES (?, ?, ?, ?)',
      [affirmation.text, affirmation.category, affirmation.time_of_day, affirmation.energy_level]
    );
  }
};

export const logSession = async (affirmationId: number, moodRating: number) => {
  if (!db) await initDatabase();

  const result = await db.runAsync(
    'INSERT INTO user_sessions (affirmation_id, mood_rating) VALUES (?, ?)',
    [affirmationId, moodRating]
  );

  // Update streak after logging session
  await updateStreak();

  return result;
};

export const getStreakData = async () => {
  if (!db) await initDatabase();

  // Get all streak records for the current month
  const today = new Date();
  const monthStart = format(startOfMonth(today), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(today), 'yyyy-MM-dd');

  const result = await db.getAllAsync(
    'SELECT * FROM streaks WHERE date BETWEEN ? AND ? ORDER BY date ASC',
    [monthStart, monthEnd]
  );

  return result;
};

export const getGoals = async () => {
  if (!db) await initDatabase();

  const result = await db.getAllAsync('SELECT * FROM goals WHERE is_active = 1');
  return result;
};

export const addGoal = async (title: string) => {
  if (!db) await initDatabase();

  const result = await db.runAsync('INSERT INTO goals (title) VALUES (?)', [title]);
  return { id: result.lastInsertRowId, title, is_active: 1 };
};

export const updateStreak = async () => {
  if (!db) await initDatabase();

  // Get all sessions ordered by timestamp
  const sessions = await db.getAllAsync('SELECT * FROM user_sessions ORDER BY timestamp DESC');

  if (sessions.length === 0) {
    return 0;
  }

  // Calculate streak with grace days
  let currentStreak = 1;
  let lastDate = new Date(sessions[0].timestamp);
  let graceDaysUsed = 0;
  const today = new Date();

  // Get the start of the current week to track grace days per week
  const weekStart = startOfWeek(today);

  // Count how many grace days have been used this week
  const graceDaysThisWeek = await db.getFirstAsync(
    'SELECT COUNT(*) as count FROM streaks WHERE is_grace_day = 1 AND date >= ?',
    [format(weekStart, 'yyyy-MM-dd')]
  );

  graceDaysUsed = graceDaysThisWeek.count;

  // Check if the last session was yesterday
  const yesterday = subDays(today, 1);
  if (isSameDay(new Date(sessions[0].timestamp), yesterday)) {
    currentStreak = 1;
  } else {
    // Check if we can use a grace day
    const daysSinceLastSession = Math.floor((today.getTime() - new Date(sessions[0].timestamp).getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceLastSession === 2 && graceDaysUsed < 2) {
      // Use a grace day
      graceDaysUsed++;
      currentStreak = 1;

      // Add the grace day to the streaks table
      await db.runAsync(
        'INSERT OR IGNORE INTO streaks (date, is_grace_day) VALUES (?, ?)',
        [format(yesterday, 'yyyy-MM-dd'), 1]
      );
    } else {
      // Reset streak
      currentStreak = 1;
    }
  }

  // Update streaks table with current streak days
  for (let i = 0; i < currentStreak; i++) {
    const date = subDays(today, i);
    const dateStr = format(date, 'yyyy-MM-dd');

    // Check if this date already exists in streaks table
    const existing = await db.getFirstAsync(
      'SELECT * FROM streaks WHERE date = ?',
      [dateStr]
    );

    if (!existing) {
      await db.runAsync(
        'INSERT INTO streaks (date, is_grace_day) VALUES (?, ?)',
        [dateStr, 0]
      );
    }
  }

  return currentStreak;
};

export const getCurrentStreak = async () => {
  if (!db) await initDatabase();

  // Get all sessions ordered by timestamp
  const sessions = await db.getAllAsync('SELECT * FROM user_sessions ORDER BY timestamp DESC');

  if (sessions.length === 0) {
    return 0;
  }

  // Calculate streak with grace days
  let currentStreak = 1;
  let lastDate = new Date(sessions[0].timestamp);
  let graceDaysUsed = 0;
  const today = new Date();

  // Get the start of the current week to track grace days per week
  const weekStart = startOfWeek(today);

  // Count how many grace days have been used this week
  const graceDaysThisWeek = await db.getFirstAsync(
    'SELECT COUNT(*) as count FROM streaks WHERE is_grace_day = 1 AND date >= ?',
    [format(weekStart, 'yyyy-MM-dd')]
  );

  graceDaysUsed = graceDaysThisWeek.count;

  // Check if the last session was yesterday
  const yesterday = subDays(today, 1);
  if (isSameDay(new Date(sessions[0].timestamp), yesterday)) {
    currentStreak = 1;
  } else {
    // Check if we can use a grace day
    const daysSinceLastSession = Math.floor((today.getTime() - new Date(sessions[0].timestamp).getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceLastSession === 2 && graceDaysUsed < 2) {
      // Use a grace day
      graceDaysUsed++;
      currentStreak = 1;
    } else {
      // Reset streak
      currentStreak = 1;
    }
  }

  return currentStreak;
};
