import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function initDB(): Promise<void> {
  db = await SQLite.openDatabaseAsync('zenblock.db');
  
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS focus_sessions (
      id TEXT PRIMARY KEY,
      start_time INTEGER NOT NULL,
      end_time INTEGER NOT NULL,
      duration INTEGER NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0
    );
  `);
}

export async function saveFocusSession(
  id: string,
  startTime: number,
  endTime: number,
  duration: number,
  completed: boolean
): Promise<void> {
  if (!db) await initDB();
  
  await db!.runAsync(
    'INSERT INTO focus_sessions (id, start_time, end_time, duration, completed) VALUES (?, ?, ?, ?, ?)',
    [id, startTime, endTime, duration, completed ? 1 : 0]
  );
}

export async function getFocusSessions(): Promise<Array<{
  id: string;
  start_time: number;
  end_time: number;
  duration: number;
  completed: boolean;
}>> {
  if (!db) await initDB();
  
  const result = await db!.getAllAsync<{
    id: string;
    start_time: number;
    end_time: number;
    duration: number;
    completed: number;
  }>('SELECT * FROM focus_sessions ORDER BY start_time DESC');
  
  return result.map(row => ({
    id: row.id,
    start_time: row.start_time,
    end_time: row.end_time,
    duration: row.duration,
    completed: row.completed === 1,
  }));
}

export async function getCompletedSessions(): Promise<Array<{
  id: string;
  start_time: number;
  end_time: number;
  duration: number;
  completed: boolean;
}>> {
  if (!db) await initDB();
  
  const result = await db!.getAllAsync<{
    id: string;
    start_time: number;
    end_time: number;
    duration: number;
    completed: number;
  }>('SELECT * FROM focus_sessions WHERE completed = 1 ORDER BY start_time DESC');
  
  return result.map(row => ({
    id: row.id,
    start_time: row.start_time,
    end_time: row.end_time,
    duration: row.duration,
    completed: row.completed === 1,
  }));
}
