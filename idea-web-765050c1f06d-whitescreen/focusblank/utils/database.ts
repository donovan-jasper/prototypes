import * as SQLite from 'expo-sqlite';

const openDatabase = async () => {
  return SQLite.openDatabase('focusblank.db');
};

const createTables = async (db) => {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS focus_modes (
      id TEXT PRIMARY KEY,
      name TEXT,
      color TEXT
    );
    CREATE TABLE IF NOT EXISTS widgets (
      id TEXT PRIMARY KEY,
      name TEXT,
      type TEXT
    );
  `);
};

const saveFocusMode = async (db, mode) => {
  await db.runAsync('INSERT INTO focus_modes (id, name, color) VALUES (?, ?, ?)', [mode.id, mode.name, mode.color]);
};

const getFocusModes = async (db) => {
  const result = await db.getAllAsync('SELECT * FROM focus_modes');
  return result;
};

export { openDatabase, createTables, saveFocusMode, getFocusModes };
