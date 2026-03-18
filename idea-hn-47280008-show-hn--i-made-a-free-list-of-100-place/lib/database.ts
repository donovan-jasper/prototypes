import * as SQLite from 'expo-sqlite';

const DB_NAME = 'launchlift.db';

export interface Directory {
  id: string;
  name: string;
  url: string;
  category: string;
  description: string;
  drScore: number;
  submissionDifficulty: string;
  avgApprovalTime: string;
  cost: string;
  requirements: string;
}

export interface Submission {
  id: number;
  directoryId: string;
  status: 'not_started' | 'submitted' | 'approved' | 'rejected';
  notes: string;
  submissionDate: string;
}

export interface AppProfile {
  id: number;
  appName: string;
  tagline: string;
  description: string;
  category: string;
  website: string;
  screenshots: string; // JSON string array
}

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) {
    return db;
  }

  db = await SQLite.openDatabaseAsync(DB_NAME);

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    
    CREATE TABLE IF NOT EXISTS directories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      drScore INTEGER,
      submissionDifficulty TEXT,
      avgApprovalTime TEXT,
      cost TEXT,
      requirements TEXT
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      directoryId TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'not_started',
      notes TEXT,
      submissionDate TEXT,
      FOREIGN KEY (directoryId) REFERENCES directories(id)
    );

    CREATE TABLE IF NOT EXISTS app_profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      appName TEXT,
      tagline TEXT,
      description TEXT,
      category TEXT,
      website TEXT,
      screenshots TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_directories_category ON directories(category);
    CREATE INDEX IF NOT EXISTS idx_directories_drScore ON directories(drScore);
    CREATE INDEX IF NOT EXISTS idx_submissions_directoryId ON submissions(directoryId);
    CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
  `);

  return db;
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    return await initDatabase();
  }
  return db;
}

export async function clearDatabase(): Promise<void> {
  const database = await getDatabase();
  await database.execAsync(`
    DELETE FROM directories;
    DELETE FROM submissions;
    DELETE FROM app_profile;
  `);
}
