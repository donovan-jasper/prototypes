import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export const initDatabase = async () => {
  if (db) return db;

  db = await SQLite.openDatabaseAsync('safecircle.db');

  // Create tables if they don't exist
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      address TEXT,
      phone TEXT,
      hours TEXT,
      notes TEXT,
      last_updated TEXT
    );

    CREATE TABLE IF NOT EXISTS saved_locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS check_ins (
      id TEXT PRIMARY KEY,
      timer_duration INTEGER NOT NULL,
      message TEXT NOT NULL,
      contacts TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS offline_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      to_phone TEXT NOT NULL,
      body TEXT NOT NULL,
      timestamp TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS community_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      created_at TEXT NOT NULL,
      user_id TEXT,
      upvotes INTEGER DEFAULT 0,
      flags INTEGER DEFAULT 0
    );
  `);

  return db;
};

// Add other existing database functions here...
