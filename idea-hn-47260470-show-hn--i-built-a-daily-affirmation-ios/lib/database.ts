import * as SQLite from 'expo-sqlite';
import { format, isSameDay, subDays } from 'date-fns';

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
      is_grace_day INTEGER DEFAULT 0
    );
  `);
};

export const seedAffirmations = async (affirmations: any[]) => {
  if (!db) await initDatabase();

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

  const result = await db.getAllAsync('SELECT * FROM streaks ORDER BY date DESC');
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

  for (let i = 1; i < sessions.length; i++) {
    const sessionDate = new Date(sessions[i].timestamp);
    const daysDiff = Math.floor((lastDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 1) {
      currentStreak++;
      lastDate = sessionDate;
    } else if (daysDiff > 1 && graceDaysUsed < 1) {
      // Check if we can use a grace day
      const previousSessionDate = new Date(sessions[i - 1].timestamp);
      const daysSinceLastSession = Math.floor((new Date().getTime() - previousSessionDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysSinceLastSession <= 2) {
        graceDaysUsed++;
        currentStreak++;
        lastDate = sessionDate;

        // Mark this as a grace day in the streaks table
        await db.runAsync(
          'INSERT INTO streaks (date, is_grace_day) VALUES (?, ?)',
          [format(sessionDate, 'yyyy-MM-dd'), 1]
        );
      } else {
        break;
      }
    } else {
      break;
    }
  }

  // Update streaks table with current streak days
  const today = new Date();
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

  for (let i = 1; i < sessions.length; i++) {
    const sessionDate = new Date(sessions[i].timestamp);
    const daysDiff = Math.floor((lastDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 1) {
      currentStreak++;
      lastDate = sessionDate;
    } else if (daysDiff > 1 && graceDaysUsed < 1) {
      // Check if we can use a grace day
      const previousSessionDate = new Date(sessions[i - 1].timestamp);
      const daysSinceLastSession = Math.floor((new Date().getTime() - previousSessionDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysSinceLastSession <= 2) {
        graceDaysUsed++;
        currentStreak++;
        lastDate = sessionDate;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  return currentStreak;
};
