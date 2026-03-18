import * as SQLite from 'expo-sqlite';

export interface Project {
  id: number;
  name: string;
  target: string;
  language: string;
  code: string;
  created_at: number;
  updated_at: number;
}

let db: SQLite.SQLiteDatabase | null = null;

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    db = SQLite.openDatabaseSync('codeforge.db');
    initializeDatabase(db);
  }
  return db;
}

function initializeDatabase(database: SQLite.SQLiteDatabase) {
  database.execSync(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      target TEXT NOT NULL,
      language TEXT NOT NULL,
      code TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);
}

export function resetDatabase() {
  if (db) {
    db.execSync('DROP TABLE IF EXISTS projects;');
    initializeDatabase(db);
  }
}
