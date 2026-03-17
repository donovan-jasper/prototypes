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
  `);
  
  return db;
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    return await initDatabase();
  }
  return db;
}
