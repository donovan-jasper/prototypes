import * as SQLite from 'expo-sqlite';

export const getComponents = async (searchQuery = '') => {
  const db = await SQLite.openDatabaseAsync('audiochain.db');
  return await db.getAllAsync(
    'SELECT * FROM components WHERE name LIKE ?',
    [`%${searchQuery}%`]
  );
};

export const getBuilds = async () => {
  const db = await SQLite.openDatabaseAsync('audiochain.db');
  return await db.getAllAsync('SELECT * FROM builds');
};

export const getBuildById = async (id: number) => {
  const db = await SQLite.openDatabaseAsync('audiochain.db');
  return await db.getFirstAsync('SELECT * FROM builds WHERE id = ?', [id]);
};

export const createBuild = async (name: string) => {
  const db = await SQLite.openDatabaseAsync('audiochain.db');
  const result = await db.runAsync(
    'INSERT INTO builds (name, created_at) VALUES (?, ?)',
    [name, new Date().toISOString()]
  );
  return result.lastInsertRowId;
};

export const updateBuild = async (id: number, name: string) => {
  const db = await SQLite.openDatabaseAsync('audiochain.db');
  return await db.runAsync(
    'UPDATE builds SET name = ? WHERE id = ?',
    [name, id]
  );
};
