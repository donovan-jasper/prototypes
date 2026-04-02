import * as SQLite from 'expo-sqlite';

let db = null;

export const getDatabase = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('vigil.db');
  }
  return db;
};

export const initializeDatabase = async () => {
  const database = await getDatabase();
  
  try {
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        calendarId TEXT NOT NULL,
        externalId TEXT,
        title TEXT NOT NULL,
        description TEXT,
        startDate TEXT NOT NULL,
        endDate TEXT NOT NULL,
        location TEXT,
        isCritical INTEGER DEFAULT 0,
        alertSettings TEXT,
        acknowledgedAt TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_events_calendarId ON events(calendarId);
      CREATE INDEX IF NOT EXISTS idx_events_startDate ON events(startDate);
      CREATE INDEX IF NOT EXISTS idx_events_externalId ON events(externalId);
      
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS calendar_connections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        provider TEXT NOT NULL,
        calendarId TEXT NOT NULL,
        accessToken TEXT,
        refreshToken TEXT,
        isActive INTEGER DEFAULT 1,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_calendar_connections_provider ON calendar_connections(provider);
      CREATE INDEX IF NOT EXISTS idx_calendar_connections_isActive ON calendar_connections(isActive);
    `);
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

export const resetDatabase = async () => {
  const database = await getDatabase();
  
  try {
    await database.execAsync(`
      DROP TABLE IF EXISTS events;
      DROP TABLE IF EXISTS settings;
      DROP TABLE IF EXISTS calendar_connections;
    `);
    
    console.log('Database reset successfully');
    await initializeDatabase();
  } catch (error) {
    console.error('Error resetting database:', error);
    throw error;
  }
};

export const migrateDatabase = async (fromVersion, toVersion) => {
  const database = await getDatabase();
  
  try {
    console.log(`Migrating database from version ${fromVersion} to ${toVersion}`);
    
    if (fromVersion < 2 && toVersion >= 2) {
      await database.execAsync(`
        ALTER TABLE calendar_connections ADD COLUMN createdAt TEXT DEFAULT CURRENT_TIMESTAMP;
      `);
    }
    
    console.log('Database migration completed');
  } catch (error) {
    console.error('Error migrating database:', error);
    throw error;
  }
};

export const getDatabaseVersion = async () => {
  const database = await getDatabase();
  try {
    const result = await database.getFirstAsync('PRAGMA user_version');
    return result?.user_version || 0;
  } catch (error) {
    console.error('Error getting database version:', error);
    return 0;
  }
};

export const setDatabaseVersion = async (version) => {
  const database = await getDatabase();
  try {
    await database.execAsync(`PRAGMA user_version = ${version}`);
  } catch (error) {
    console.error('Error setting database version:', error);
    throw error;
  }
};
