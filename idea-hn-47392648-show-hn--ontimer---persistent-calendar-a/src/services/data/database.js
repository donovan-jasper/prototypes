import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('vigil.db');

export const initializeDatabase = () => {
  db.transaction((tx) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        external_id TEXT,
        calendar_id TEXT,
        title TEXT NOT NULL,
        description TEXT,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        location TEXT,
        is_critical INTEGER DEFAULT 0,
        alert_settings TEXT,
        acknowledgment_status TEXT DEFAULT 'pending',
        snooze_until TEXT, 
        last_modified TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );`,
      [],
      () => console.log('Events table created successfully'),
      (_, error) => console.error('Error creating events table:', error)
    );

    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );`,
      [],
      () => console.log('Settings table created successfully'),
      (_, error) => console.error('Error creating settings table:', error)
    );
  });
};

export default db;
