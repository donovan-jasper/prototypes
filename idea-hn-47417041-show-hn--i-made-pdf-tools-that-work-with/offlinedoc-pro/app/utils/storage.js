import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('offlinedoc.db');

export const initDB = () => {
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS files (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, data BLOB);'
    );
  });
};

export const saveFile = (name, data) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO files (name, data) VALUES (?, ?);',
        [name, data],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const getFiles = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM files;',
        [],
        (_, { rows: { _array } }) => resolve(_array),
        (_, error) => reject(error)
      );
    });
  });
};
