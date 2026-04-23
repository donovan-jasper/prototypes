import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('mediamesh.db');

export const initDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS media (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          cloudId TEXT NOT NULL,
          source TEXT NOT NULL,
          localPath TEXT NOT NULL,
          hash TEXT,
          metadata TEXT,
          syncedAt INTEGER NOT NULL
        );`
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS clouds (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          service TEXT NOT NULL,
          token TEXT NOT NULL,
          lastSync INTEGER
        );`
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS sync_rules (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          cloudId INTEGER NOT NULL,
          filters TEXT,
          FOREIGN KEY(cloudId) REFERENCES clouds(id)
        );`
      );

      tx.executeSql(
        `CREATE INDEX IF NOT EXISTS idx_media_source ON media(source);`
      );

      tx.executeSql(
        `CREATE INDEX IF NOT EXISTS idx_media_hash ON media(hash);`
      );
    }, reject, resolve);
  });
};

export const insertMedia = async (media: {
  cloudId: string;
  source: string;
  localPath: string;
  hash?: string;
  metadata?: string;
  syncedAt: number;
}) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO media (cloudId, source, localPath, hash, metadata, syncedAt)
         VALUES (?, ?, ?, ?, ?, ?);`,
        [media.cloudId, media.source, media.localPath, media.hash || '', media.metadata || '', media.syncedAt],
        (_, result) => resolve(result.insertId),
        (_, error) => reject(error)
      );
    });
  });
};

export const getMediaBySource = async (source: string) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM media WHERE source = ?;`,
        [source],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

export const getAllMedia = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM media;`,
        [],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

export const updateMediaHash = async (id: string, hash: string) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE media SET hash = ? WHERE id = ?;`,
        [hash, id],
        (_, result) => resolve(result.rowsAffected),
        (_, error) => reject(error)
      );
    });
  });
};
