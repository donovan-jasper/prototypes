import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('mediamesh.db');

export const initDatabase = () => {
  db.transaction((tx) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS media (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cloudId TEXT NOT NULL,
        source TEXT NOT NULL,
        localPath TEXT NOT NULL,
        hash TEXT NOT NULL,
        metadata TEXT,
        syncedAt INTEGER NOT NULL
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS clouds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service TEXT NOT NULL,
        token TEXT NOT NULL,
        lastSync INTEGER
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS sync_rules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cloudId INTEGER NOT NULL,
        filters TEXT,
        FOREIGN KEY (cloudId) REFERENCES clouds (id)
      );`
    );
  });
};
