import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('brainvault.db');

export const initDB = () => {
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);'
    );
  });
};

export const saveItem = (text) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO items (text) VALUES (?);',
      [text]
    );
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
