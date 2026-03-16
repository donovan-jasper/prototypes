import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('lifethread.db');

export const initDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS habits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            icon TEXT NOT NULL,
            frequency TEXT NOT NULL,
            user_id INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );`
        );
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS habit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            habit_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            completed BOOLEAN NOT NULL,
            value REAL,
            source TEXT DEFAULT 'manual',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (habit_id) REFERENCES habits (id)
          );`
        );
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS timeline_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            title TEXT NOT NULL,
            date TEXT NOT NULL,
            notes TEXT,
            attachments TEXT,
            user_id INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );`
        );
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            age INTEGER,
            gender TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );`
        );
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            key TEXT NOT NULL,
            value TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
          );`
        );
      },
      error => reject(error),
      () => resolve(db)
    );
  });
};

export const resetDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql('DROP TABLE IF EXISTS habits;');
        tx.executeSql('DROP TABLE IF EXISTS habit_logs;');
        tx.executeSql('DROP TABLE IF EXISTS timeline_events;');
        tx.executeSql('DROP TABLE IF EXISTS users;');
        tx.executeSql('DROP TABLE IF EXISTS settings;');
      },
      error => reject(error),
      () => resolve(db)
    );
  });
};

export const getDatabase = () => db;
