import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('wardrobe.db');

export const initDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS wardrobe (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, category TEXT);'
    );
  });
};

export const addItem = (name, category) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO wardrobe (name, category) values (?, ?)',
      [name, category]
    );
  });
};

export const getWardrobe = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM wardrobe',
        [],
        (_, { rows: { _array } }) => resolve(_array),
        (_, error) => reject(error)
      );
    });
  });
};
