import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('protopulse.db');
    await initDatabase();
  }
  return db;
}

export async function initDatabase(): Promise<void> {
  const database = await getDatabase();
  
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      appType TEXT,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS screens (
      id TEXT PRIMARY KEY,
      projectId TEXT NOT NULL,
      name TEXT NOT NULL,
      "order" INTEGER NOT NULL,
      layout TEXT,
      FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS components (
      id TEXT PRIMARY KEY,
      screenId TEXT NOT NULL,
      type TEXT NOT NULL,
      props TEXT,
      position TEXT,
      "order" INTEGER NOT NULL,
      FOREIGN KEY (screenId) REFERENCES screens(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_screens_projectId ON screens(projectId);
    CREATE INDEX IF NOT EXISTS idx_components_screenId ON components(screenId);
  `);
}
