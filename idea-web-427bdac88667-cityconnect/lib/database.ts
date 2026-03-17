import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function initializeDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) {
    return db;
  }

  db = await SQLite.openDatabaseAsync('localloop.db');

  // Create users table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      interests TEXT,
      reliabilityScore REAL DEFAULT 0,
      createdAt TEXT NOT NULL
    );
  `);

  // Create activities table with indexes
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      startTime TEXT NOT NULL,
      organizerId INTEGER NOT NULL,
      maxAttendees INTEGER,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (organizerId) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_activities_latitude ON activities(latitude);
    CREATE INDEX IF NOT EXISTS idx_activities_longitude ON activities(longitude);
    CREATE INDEX IF NOT EXISTS idx_activities_startTime ON activities(startTime);
    CREATE INDEX IF NOT EXISTS idx_activities_category ON activities(category);
  `);

  // Create rsvps table with indexes
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS rsvps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      activityId INTEGER NOT NULL,
      userId INTEGER NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('going', 'interested')),
      createdAt TEXT NOT NULL,
      FOREIGN KEY (activityId) REFERENCES activities(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(activityId, userId)
    );

    CREATE INDEX IF NOT EXISTS idx_rsvps_activityId ON rsvps(activityId);
    CREATE INDEX IF NOT EXISTS idx_rsvps_userId ON rsvps(userId);
    CREATE INDEX IF NOT EXISTS idx_rsvps_status ON rsvps(status);
  `);

  // Insert mock user if not exists
  const existingUser = await db.getFirstAsync('SELECT id FROM users WHERE id = 1');
  if (!existingUser) {
    await db.runAsync(
      `INSERT INTO users (id, name, email, interests, reliabilityScore, createdAt)
       VALUES (1, 'Demo User', 'demo@localloop.app', 'sports,food,games', 0.95, ?)`,
      [new Date().toISOString()]
    );
  }

  return db;
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    return await initializeDatabase();
  }
  return db;
}
