import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase() {
  db = await SQLite.openDatabaseAsync('bridgecircle.db');

  // Initialize tables
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      age INTEGER NOT NULL,
      bio TEXT,
      isPremium BOOLEAN DEFAULT 0,
      createdAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS interests (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      interest TEXT NOT NULL,
      category TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS matches (
      id TEXT PRIMARY KEY,
      userId1 TEXT NOT NULL,
      userId2 TEXT NOT NULL,
      status TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      FOREIGN KEY (userId1) REFERENCES users(id),
      FOREIGN KEY (userId2) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      matchId TEXT NOT NULL,
      senderId TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      isRead BOOLEAN DEFAULT 0,
      FOREIGN KEY (matchId) REFERENCES matches(id),
      FOREIGN KEY (senderId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      matchId TEXT NOT NULL,
      scheduledAt INTEGER NOT NULL,
      duration INTEGER NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      peerName TEXT,
      FOREIGN KEY (matchId) REFERENCES matches(id)
    );

    CREATE TABLE IF NOT EXISTS session_reports (
      id TEXT PRIMARY KEY,
      sessionId TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      reason TEXT NOT NULL,
      status TEXT NOT NULL,
      FOREIGN KEY (sessionId) REFERENCES sessions(id)
    );
  `);
}

export async function insertSessionReport(report: {
  id: string;
  sessionId: string;
  timestamp: number;
  reason: string;
  status: string;
}): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  await db.runAsync(
    `INSERT INTO session_reports (id, sessionId, timestamp, reason, status)
     VALUES (?, ?, ?, ?, ?)`,
    [report.id, report.sessionId, report.timestamp, report.reason, report.status]
  );
}

export async function getSessionById(sessionId: string): Promise<any> {
  if (!db) throw new Error('Database not initialized');

  const result = await db.getFirstAsync(
    'SELECT * FROM sessions WHERE id = ?',
    [sessionId]
  );

  return result;
}

export async function updateSessionStatus(sessionId: string, status: string): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  await db.runAsync(
    'UPDATE sessions SET status = ? WHERE id = ?',
    [status, sessionId]
  );
}

// ... (rest of the database functions remain the same)
