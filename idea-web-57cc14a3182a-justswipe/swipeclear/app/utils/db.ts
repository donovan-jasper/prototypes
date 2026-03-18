import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('swipeclear.db');

export const initDB = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS notifications (
          id TEXT PRIMARY KEY, 
          title TEXT, 
          body TEXT, 
          app TEXT, 
          timestamp INTEGER,
          archived BOOLEAN, 
          muted BOOLEAN, 
          pinned BOOLEAN, 
          deleted BOOLEAN
        );`,
        [],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};

export const getItems = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM notifications;',
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
        'UPDATE notifications SET archived = ?, muted = ?, pinned = ?, deleted = ? WHERE id = ?;',
        [item.archived ? 1 : 0, item.muted ? 1 : 0, item.pinned ? 1 : 0, item.deleted ? 1 : 0, item.id],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};

export const insertNotification = (notification) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT OR REPLACE INTO notifications (id, title, body, app, timestamp, archived, muted, pinned, deleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);',
        [
          notification.id,
          notification.title,
          notification.body,
          notification.app,
          notification.timestamp,
          0, 0, 0, 0
        ],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};

export const deleteNotification = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM notifications WHERE id = ?;',
        [id],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};
