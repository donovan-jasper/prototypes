import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('brainvault.db');

export const initDB = () => {
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT, type TEXT DEFAULT "text", channel_id INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);'
    );
  });
};

export const saveItem = (text, type = 'text', channelId = null) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO items (text, type, channel_id) VALUES (?, ?, ?);',
        [text, type, channelId],
        (_, { insertId }) => resolve({ id: insertId }),
        (_, error) => reject(error)
      );
    });
  });
};

export const getItems = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM items;',
        [],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};
