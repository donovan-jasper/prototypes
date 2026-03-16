import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('ideaspark.db');

export const initDatabase = () => {
  db.transaction((tx) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS ideas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ideaId INTEGER NOT NULL,
        comment TEXT NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ideaId) REFERENCES ideas (id)
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        sparkScore INTEGER DEFAULT 0,
        bio TEXT
      );`
    );
  });
};

export const getDatabase = () => db;
