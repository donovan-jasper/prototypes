import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('finch.db');

export const initDatabase = async () => {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS watchlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      symbol TEXT NOT NULL,
      name TEXT NOT NULL,
      added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS lesson_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lesson_id TEXT NOT NULL,
      completed BOOLEAN DEFAULT FALSE,
      score INTEGER DEFAULT 0,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(lesson_id)
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      symbol TEXT NOT NULL,
      target_price REAL NOT NULL,
      condition TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

export const getLessonProgress = async () => {
  const result = await db.getAllAsync('SELECT * FROM lesson_progress');
  return result;
};

export const saveLessonProgress = async (lessonId: string, completed: boolean, score: number) => {
  await db.runAsync(
    'INSERT OR REPLACE INTO lesson_progress (lesson_id, completed, score) VALUES (?, ?, ?)',
    [lessonId, completed ? 1 : 0, score]
  );
};

export const addToWatchlist = async (symbol: string, name: string) => {
  await db.runAsync(
    'INSERT INTO watchlist (symbol, name) VALUES (?, ?)',
    [symbol, name]
  );
};

export const getWatchlist = async () => {
  const result = await db.getAllAsync('SELECT * FROM watchlist ORDER BY added_at DESC');
  return result;
};

export const removeFromWatchlist = async (symbol: string) => {
  await db.runAsync('DELETE FROM watchlist WHERE symbol = ?', [symbol]);
};

export const scheduleAlert = async (symbol: string, targetPrice: number, condition: 'above' | 'below') => {
  const result = await db.runAsync(
    'INSERT INTO alerts (symbol, target_price, condition) VALUES (?, ?, ?)',
    [symbol, targetPrice, condition]
  );
  return result.lastInsertRowId;
};

export const getAlerts = async () => {
  const result = await db.getAllAsync('SELECT * FROM alerts');
  return result;
};

export const cancelAlert = async (id: number) => {
  await db.runAsync('DELETE FROM alerts WHERE id = ?', [id]);
};
