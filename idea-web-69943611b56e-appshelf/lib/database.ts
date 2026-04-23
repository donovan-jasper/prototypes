import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('flowdeck.db');

export const initDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS modes (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            color TEXT NOT NULL,
            icon TEXT,
            appIds TEXT NOT NULL,
            triggers TEXT
          );`
        );
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS apps (
            packageName TEXT PRIMARY KEY,
            label TEXT NOT NULL,
            icon TEXT,
            lastUsed INTEGER
          );`
        );
      },
      (error) => reject(error),
      () => resolve(true)
    );
  });
};

export const saveMode = async (mode: any) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'INSERT OR REPLACE INTO modes (id, name, color, icon, appIds, triggers) VALUES (?, ?, ?, ?, ?, ?)',
          [
            mode.id,
            mode.name,
            mode.color,
            mode.icon || null,
            JSON.stringify(mode.appIds),
            JSON.stringify(mode.triggers || {}),
          ],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const getModes = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM modes',
          [],
          (_, { rows }) => {
            const modes = rows._array.map((row) => ({
              ...row,
              appIds: JSON.parse(row.appIds),
              triggers: row.triggers ? JSON.parse(row.triggers) : {},
            }));
            resolve(modes);
          },
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const deleteMode = async (modeId: string) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'DELETE FROM modes WHERE id = ?',
          [modeId],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      }
    );
  });
};
