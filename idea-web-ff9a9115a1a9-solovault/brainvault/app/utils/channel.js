import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('brainvault.db');

export const initDB = () => {
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS channels (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT);'
    );
  });
};

export const createChannel = (name) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO channels (name) VALUES (?);',
        [name],
        (_, { insertId }) => resolve({ id: insertId, name }),
        (_, error) => reject(error)
      );
    });
  });
};

export const getChannels = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM channels;',
        [],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};
