import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('brainvault.db');

export const searchItems = (query) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM items WHERE text LIKE ?;',
        [`%${query}%`],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};
