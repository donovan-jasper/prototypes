import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('discordx.db');

export const initDB = () => {
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY, text TEXT);'
    );
  });
};

export const saveMessageOffline = (message) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO messages (id, text) VALUES (?, ?);',
        [message.id, message.text],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const getOfflineMessages = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM messages;',
        [],
        (_, { rows: { _array } }) => resolve(_array),
        (_, error) => reject(error)
      );
    });
  });
};
