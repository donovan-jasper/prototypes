import * as SQLite from 'expo-sqlite';

const openDatabase = (dbName) => {
  return SQLite.openDatabase(dbName);
};

const createDatabase = async (name, schema) => {
  const db = openDatabase(name);
  const columns = schema.map(field => `${field.name} ${field.type}`).join(', ');
  await db.execAsync([{ sql: `CREATE TABLE IF NOT EXISTS rows (id INTEGER PRIMARY KEY AUTOINCREMENT, ${columns})`, args: [] }]);
  return { id: name, name, schema };
};

const addRow = async (dbId, data) => {
  const db = openDatabase(dbId);
  const columns = Object.keys(data).join(', ');
  const placeholders = Object.keys(data).map(() => '?').join(', ');
  const values = Object.values(data);
  await db.runAsync(`INSERT INTO rows (${columns}) VALUES (${placeholders})`, values);
};

const queryRows = async (dbId, sql) => {
  const db = openDatabase(dbId);
  const result = await db.getAllAsync(sql);
  return result;
};

const updateRow = async (dbId, rowId, data) => {
  const db = openDatabase(dbId);
  const updates = Object.keys(data).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(data), rowId];
  await db.runAsync(`UPDATE rows SET ${updates} WHERE id = ?`, values);
};

const deleteRow = async (dbId, rowId) => {
  const db = openDatabase(dbId);
  await db.runAsync('DELETE FROM rows WHERE id = ?', [rowId]);
};

const deleteDatabase = async (dbId) => {
  const db = openDatabase(dbId);
  await db.execAsync([{ sql: 'DROP TABLE IF EXISTS rows', args: [] }]);
};

export { createDatabase, addRow, queryRows, updateRow, deleteRow, deleteDatabase };
