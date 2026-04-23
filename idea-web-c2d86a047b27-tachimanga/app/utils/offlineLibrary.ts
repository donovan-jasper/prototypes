import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('pageturner.db');

export const initDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS content (id TEXT PRIMARY KEY, title TEXT, pages TEXT);',
        [],
        () => resolve(true),
        (_, error) => reject(error)
      );
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS reading_progress (content_id TEXT PRIMARY KEY, scroll_position REAL, percentage REAL, last_updated INTEGER);',
        [],
        () => resolve(true),
        (_, error) => reject(error)
      );
    });
  });
};

export const getContent = async (contentId: string) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM content WHERE id = ?;',
        [contentId],
        (_, { rows }) => {
          if (rows.length > 0) {
            const content = rows.item(0);
            content.pages = JSON.parse(content.pages);
            resolve(content);
          } else {
            reject(new Error('Content not found'));
          }
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const saveReadingProgress = async (contentId: string, scrollPosition: number, percentage: number) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT OR REPLACE INTO reading_progress (content_id, scroll_position, percentage, last_updated) VALUES (?, ?, ?, ?);',
        [contentId, scrollPosition, percentage, Date.now()],
        () => resolve(true),
        (_, error) => reject(error)
      );
    });
  });
};

export const getReadingProgress = async (contentId: string) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM reading_progress WHERE content_id = ?;',
        [contentId],
        (_, { rows }) => {
          if (rows.length > 0) {
            resolve(rows.item(0));
          } else {
            resolve(null);
          }
        },
        (_, error) => reject(error)
      );
    });
  });
};
