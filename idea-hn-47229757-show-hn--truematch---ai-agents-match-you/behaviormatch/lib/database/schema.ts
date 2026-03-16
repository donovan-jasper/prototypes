import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('behaviormatch.db');

export const initializeDatabase = () => {
  db.transaction(tx => {
    // Create users table
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        preferences_json TEXT
      );`
    );

    // Create interactions table
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS interactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        type TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        metadata_json TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );`
    );

    // Create behavior_vectors table
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS behavior_vectors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        vector_data TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );`
    );

    // Create matches table
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS matches (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        matched_user_id TEXT,
        compatibility_score REAL,
        status TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );`
    );

    // Create conversations table
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        match_id TEXT,
        messages_json TEXT,
        FOREIGN KEY (match_id) REFERENCES matches (id)
      );`
    );
  });
};
