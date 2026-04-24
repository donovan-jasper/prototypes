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

export const saveComponentPosition = async (buildId: number, componentId: number, x: number, y: number) => {
  const db = await SQLite.openDatabaseAsync('audiochain.db');
  await db.runAsync(
    'INSERT OR REPLACE INTO build_components (build_id, component_id, position, x, y) VALUES (?, ?, ?, ?, ?)',
    [buildId, componentId, 0, x, y]
  );
};
