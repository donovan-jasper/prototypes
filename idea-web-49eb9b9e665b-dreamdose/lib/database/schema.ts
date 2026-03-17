import * as SQLite from 'expo-sqlite';

export interface SessionRecord {
  id: string;
  duration_minutes: number;
  start_time: number;
  end_time: number | null;
  status: 'pending' | 'active' | 'paused' | 'completed' | 'interrupted';
  energy_rating: number | null;
  soundscape_id: string | null;
  created_at: number;
}

export interface UserPreferencesRecord {
  id: number;
  default_duration: number;
  haptic_enabled: number;
  notifications_enabled: number;
  created_at: number;
  updated_at: number;
}

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  
  db = await SQLite.openDatabaseAsync('restpulse.db');
  
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      duration_minutes INTEGER NOT NULL,
      start_time INTEGER NOT NULL,
      end_time INTEGER,
      status TEXT NOT NULL,
      energy_rating INTEGER,
      soundscape_id TEXT,
      created_at INTEGER NOT NULL
    );
    
    CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
    CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at DESC);

    CREATE TABLE IF NOT EXISTS user_preferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      default_duration INTEGER NOT NULL DEFAULT 15,
      haptic_enabled INTEGER NOT NULL DEFAULT 1,
      notifications_enabled INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  const existingPrefs = await db.getFirstAsync<UserPreferencesRecord>(
    'SELECT * FROM user_preferences LIMIT 1'
  );

  if (!existingPrefs) {
    const now = Date.now();
    await db.runAsync(
      'INSERT INTO user_preferences (default_duration, haptic_enabled, notifications_enabled, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      [15, 1, 1, now, now]
    );
  }
  
  return db;
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    return await initDatabase();
  }
  return db;
}
