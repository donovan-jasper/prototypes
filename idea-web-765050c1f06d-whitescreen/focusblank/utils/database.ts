import * as SQLite from 'expo-sqlite';

const openDatabase = async () => {
  return SQLite.openDatabaseAsync('focusblank.db');
};

const createTables = async (db: SQLite.SQLiteDatabase) => {
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
      type TEXT,
      x REAL,
      y REAL
    );
    CREATE TABLE IF NOT EXISTS screen_time (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT,
      seconds INTEGER
    );
  `);
};

const saveFocusMode = async (db: SQLite.SQLiteDatabase, mode: any) => {
  await db.runAsync('INSERT OR REPLACE INTO focus_modes (id, name, color) VALUES (?, ?, ?)', [mode.id, mode.name, mode.color]);
};

const getFocusModes = async (db: SQLite.SQLiteDatabase) => {
  const result = await db.getAllAsync('SELECT * FROM focus_modes');
  return result;
};

const isFocusModesEmpty = async (db: SQLite.SQLiteDatabase) => {
  const result = await db.getFirstAsync('SELECT COUNT(*) as count FROM focus_modes') as any;
  return result.count === 0;
};

const saveWidgetPosition = async (db: SQLite.SQLiteDatabase, id: string, x: number, y: number) => {
  await db.runAsync('UPDATE widgets SET x = ?, y = ? WHERE id = ?', [x, y, id]);
};

const getWidgetPositions = async (db: SQLite.SQLiteDatabase) => {
  const result = await db.getAllAsync('SELECT * FROM widgets');
  return result;
};

export { openDatabase, createTables, saveFocusMode, getFocusModes, isFocusModesEmpty, saveWidgetPosition, getWidgetPositions };
