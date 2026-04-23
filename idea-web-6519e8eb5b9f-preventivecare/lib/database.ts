import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase(): Promise<void> {
  db = await SQLite.openDatabaseAsync('lifethread.db');

  // Create tables if they don't exist
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      age INTEGER,
      gender TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT,
      icon TEXT,
      frequency TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS habit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id INTEGER,
      user_id INTEGER,
      date TEXT,
      completed INTEGER DEFAULT 0,
      value REAL,
      source TEXT,
      FOREIGN KEY (habit_id) REFERENCES habits(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS timeline_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      type TEXT,
      title TEXT,
      date TEXT,
      notes TEXT,
      attachments TEXT,
      completed INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      type TEXT,
      screening_type TEXT,
      notification_id TEXT,
      scheduled_date TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      key TEXT,
      value TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Initialize with default user if none exists
  const userCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM users');
  if (userCount.count === 0) {
    await db.runAsync(
      'INSERT INTO users (name, age, gender) VALUES (?, ?, ?)',
      ['Default User', 45, 'female']
    );
  }
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    await initDatabase();
  }
  return db!;
}

export async function resetDatabase(): Promise<void> {
  if (db) {
    await db.execAsync(`
      DROP TABLE IF EXISTS users;
      DROP TABLE IF EXISTS habits;
      DROP TABLE IF EXISTS habit_logs;
      DROP TABLE IF EXISTS timeline_events;
      DROP TABLE IF EXISTS notifications;
      DROP TABLE IF EXISTS settings;
    `);
    db = null;
    await initDatabase();
  }
}
