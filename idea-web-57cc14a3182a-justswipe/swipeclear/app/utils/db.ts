import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('swipeclear.db');

export const initDB = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, archived BOOLEAN, muted BOOLEAN, pinned BOOLEAN, deleted BOOLEAN);',
        [],
        () => {
          tx.executeSql(
            'INSERT INTO items (name, archived, muted, pinned, deleted) VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?), (?, ?, ?, ?, ?);',
            ['Message 1', false, false, false, false, 'Notification 1', false, false, false, false, 'App 1', false, false, false, false],
            () => resolve(),
            (_, error) => reject(error)
          );
        },
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
        (_, { rows: { _array } }) => resolve(_array),
        (_, error) => reject(error)
      );
    });
  });
};

export const updateItem = (item) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE items SET archived = ?, muted = ?, pinned = ?, deleted = ? WHERE id = ?;',
        [item.archived, item.muted, item.pinned, item.deleted, item.id],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};
