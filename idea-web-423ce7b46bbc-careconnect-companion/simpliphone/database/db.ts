import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('simpliphone.db');

export const initDB = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        photo TEXT,
        isFavorite BOOLEAN NOT NULL DEFAULT 0,
        isEmergency BOOLEAN NOT NULL DEFAULT 0
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS medications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        dosage TEXT NOT NULL,
        schedule TEXT NOT NULL,
        photo TEXT
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        theme TEXT NOT NULL DEFAULT 'light',
        textSize INTEGER NOT NULL DEFAULT 16
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS adherence_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        medicationId INTEGER NOT NULL,
        status TEXT NOT NULL,
        timestamp DATETIME NOT NULL,
        FOREIGN KEY (medicationId) REFERENCES medications (id)
      );`
    );
  });
};

export default db;
