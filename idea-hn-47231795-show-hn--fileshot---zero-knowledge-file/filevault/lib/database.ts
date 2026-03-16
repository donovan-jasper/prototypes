import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('filevault.db');

export const initDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS files (
        id TEXT PRIMARY KEY,
        name TEXT,
        size INTEGER,
        encryptedPath TEXT,
        createdAt INTEGER,
        expiresAt INTEGER
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS shares (
        id TEXT PRIMARY KEY,
        fileId TEXT,
        linkId TEXT,
        expiresAt INTEGER,
        downloadCount INTEGER,
        maxDownloads INTEGER,
        FOREIGN KEY(fileId) REFERENCES files(id)
      );`
    );
  });
};

export const addFile = (file) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO files (id, name, size, encryptedPath, createdAt, expiresAt) VALUES (?, ?, ?, ?, ?, ?)',
        [file.id, file.name, file.size, file.encryptedPath, file.createdAt, file.expiresAt],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const getFiles = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM files ORDER BY createdAt DESC',
        [],
        (_, { rows: { _array } }) => resolve(_array),
        (_, error) => reject(error)
      );
    });
  });
};

export const deleteFile = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM files WHERE id = ?',
        [id],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const addShare = (share) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO shares (id, fileId, linkId, expiresAt, downloadCount, maxDownloads) VALUES (?, ?, ?, ?, ?, ?)',
        [share.id, share.fileId, share.linkId, share.expiresAt, share.downloadCount, share.maxDownloads],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const getShare = (linkId) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM shares WHERE linkId = ?',
        [linkId],
        (_, { rows: { _array } }) => resolve(_array[0]),
        (_, error) => reject(error)
      );
    });
  });
};

export const deleteExpiredFiles = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM files WHERE expiresAt < ?',
        [Date.now()],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};
