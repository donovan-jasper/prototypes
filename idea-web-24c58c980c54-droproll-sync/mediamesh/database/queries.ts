import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('mediamesh.db');

export const insertMedia = (media) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO media (cloudId, source, localPath, hash, metadata, syncedAt) VALUES (?, ?, ?, ?, ?, ?)',
        [media.cloudId, media.source, media.localPath, media.hash, JSON.stringify(media.metadata), media.syncedAt],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const getMediaBySource = (source) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM media WHERE source = ?',
        [source],
        (_, result) => resolve(result.rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

export const getAllMedia = () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM media ORDER BY syncedAt DESC',
        [],
        (_, result) => resolve(result.rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

export const insertCloud = (cloud) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO clouds (service, token, lastSync) VALUES (?, ?, ?)',
        [cloud.service, cloud.token, Date.now()],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const getClouds = () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM clouds',
        [],
        (_, result) => resolve(result.rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

export const deleteCloud = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'DELETE FROM clouds WHERE id = ?',
        [id],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};
