import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase;

const initDB = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('datapal.db');
  }
  return db;
};

export const createDatabase = async (name: string, fields: any[]) => {
  const database = await initDB();
  const fieldDefinitions = fields.map(field => `${field.name} ${field.type}`).join(', ');
  const sql = `CREATE TABLE IF NOT EXISTS ${name} (id INTEGER PRIMARY KEY AUTOINCREMENT, ${fieldDefinitions})`;
  await database.execAsync(sql);
};

export const insertRow = async (table: string, data: any) => {
  const database = await initDB();
  const columns = Object.keys(data).join(', ');
  const placeholders = Object.keys(data).map(() => '?').join(', ');
  const values = Object.values(data);
  const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
  await database.runAsync(sql, values as any[]);
};

export const queryDatabase = async (table: string, sql: string) => {
  const database = await initDB();
  const result = await database.getAllAsync(sql);
  return result;
};

export const deleteDatabase = async (name: string) => {
  const database = await initDB();
  const sql = `DROP TABLE IF EXISTS ${name}`;
  await database.execAsync(sql);
};

export const listDatabases = async () => {
  const database = await initDB();
  const sql = "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'";
  const result = await database.getAllAsync(sql);
  return result as any[];
};
