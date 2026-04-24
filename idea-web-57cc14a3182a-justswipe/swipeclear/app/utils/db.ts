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
          archived INTEGER DEFAULT 0,
          muted INTEGER DEFAULT 0,
          pinned INTEGER DEFAULT 0,
          deleted INTEGER DEFAULT 0
        );`,
        [],
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
        `INSERT OR REPLACE INTO notifications (id, title, body, app, timestamp)
         VALUES (?, ?, ?, ?, ?);`,
        [notification.id, notification.title, notification.body, notification.app, notification.timestamp],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const getItems = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM notifications;`,
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
        `UPDATE notifications
         SET archived = ?, muted = ?, pinned = ?, deleted = ?
         WHERE id = ?;`,
        [item.archived ? 1 : 0, item.muted ? 1 : 0, item.pinned ? 1 : 0, item.deleted ? 1 : 0, item.id],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const deleteNotification = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `DELETE FROM notifications WHERE id = ?;`,
        [id],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};
