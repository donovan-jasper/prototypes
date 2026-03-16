import * as SQLite from 'expo-sqlite';

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
