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
            'SELECT COUNT(*) as count FROM items;',
            [],
            (_, { rows }) => {
              if (rows._array[0].count === 0) {
                tx.executeSql(
                  'INSERT INTO items (name, archived, muted, pinned, deleted) VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?), (?, ?, ?, ?, ?), (?, ?, ?, ?, ?), (?, ?, ?, ?, ?);',
                  [
                    'Message 1', 0, 0, 0, 0,
                    'Notification 1', 0, 0, 0, 0,
                    'App 1', 0, 0, 0, 0,
                    'Message 2', 0, 0, 0, 0,
                    'Notification 2', 0, 0, 0, 0
                  ],
                  () => resolve(),
                  (_, error) => reject(error)
                );
              } else {
                resolve();
              }
            },
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
        (_, { rows: { _array } }) => {
          const items = _array.map(item => ({
            ...item,
            archived: Boolean(item.archived),
            muted: Boolean(item.muted),
            pinned: Boolean(item.pinned),
            deleted: Boolean(item.deleted),
          }));
          resolve(items);
        },
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
        [item.archived ? 1 : 0, item.muted ? 1 : 0, item.pinned ? 1 : 0, item.deleted ? 1 : 0, item.id],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};
