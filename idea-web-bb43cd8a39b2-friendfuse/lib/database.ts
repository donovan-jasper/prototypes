import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('friendspark.db');

export const openDatabase = () => db;

export const initDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Create friends table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS friends (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          avatar TEXT,
          created_at TEXT NOT NULL
        );`
      );

      // Create interactions table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS interactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          friend_id INTEGER NOT NULL,
          type TEXT NOT NULL,
          timestamp TEXT NOT NULL,
          notes TEXT,
          FOREIGN KEY (friend_id) REFERENCES friends (id)
        );`
      );

      // Create challenges table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS challenges (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          friend_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          status TEXT NOT NULL,
          created_at TEXT NOT NULL,
          completed_at TEXT,
          FOREIGN KEY (friend_id) REFERENCES friends (id)
        );`
      );

      // Create settings table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          key TEXT NOT NULL UNIQUE,
          value TEXT NOT NULL
        );`
      );
    }, error => {
      console.error('Database initialization failed:', error);
      reject(error);
    }, () => {
      console.log('Database initialized successfully');
      resolve(true);
    });
  });
};
