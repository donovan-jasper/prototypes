import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('flowdeck.db');

export const initDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS modes (
        id TEXT PRIMARY KEY,
        name TEXT,
        color TEXT,
        appIds TEXT,
        triggers TEXT,
        createdAt TEXT
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS apps (
        packageName TEXT PRIMARY KEY,
        label TEXT,
        icon TEXT,
        lastUsed TEXT
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS gestures (
        id TEXT PRIMARY KEY,
        pattern TEXT,
        action TEXT
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );`
    );
  });
};

export const saveMode = (mode) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT OR REPLACE INTO modes (id, name, color, appIds, triggers, createdAt)
         VALUES (?, ?, ?, ?, ?, ?);`,
        [mode.id, mode.name, mode.color, JSON.stringify(mode.appIds), JSON.stringify(mode.triggers), new Date().toISOString()],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const getModes = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM modes;`,
        [],
        (_, { rows: { _array } }) => {
          const modes = _array.map(mode => ({
            ...mode,
            appIds: JSON.parse(mode.appIds),
            triggers: JSON.parse(mode.triggers),
          }));
          resolve(modes);
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const deleteMode = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `DELETE FROM modes WHERE id = ?;`,
        [id],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const saveGesture = (gesture) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT OR REPLACE INTO gestures (id, pattern, action)
         VALUES (?, ?, ?);`,
        [gesture.id, JSON.stringify(gesture.pattern), gesture.action],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};
