import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('sleepcue.db');

const initializeDatabase = async () => {
  try {
    await db.transactionAsync(async (tx) => {
      // Create sleep sessions table
      await tx.executeSqlAsync(`
        CREATE TABLE IF NOT EXISTS sleep_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          is_sleeping INTEGER NOT NULL,
          confidence REAL NOT NULL,
          timestamp TEXT NOT NULL
        );
      `);

      // Create user settings table
      await tx.executeSqlAsync(`
        CREATE TABLE IF NOT EXISTS user_settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          rewind_amount INTEGER DEFAULT 2,
          sensitivity REAL DEFAULT 0.05,
          fade_duration INTEGER DEFAULT 3,
          last_updated TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create battery stats table
      await tx.executeSqlAsync(`
        CREATE TABLE IF NOT EXISTS battery_stats (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          battery_saved REAL NOT NULL,
          timestamp TEXT NOT NULL
        );
      `);

      // Initialize default settings if not exists
      await tx.executeSqlAsync(`
        INSERT OR IGNORE INTO user_settings (id)
        VALUES (1);
      `);
    });

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

// Initialize database when module is imported
initializeDatabase();

export { db };
