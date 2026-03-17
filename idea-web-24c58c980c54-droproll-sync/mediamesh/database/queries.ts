import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('mediamesh.db');

export const initDatabase = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cloudId TEXT NOT NULL,
      source TEXT NOT NULL,
      localPath TEXT NOT NULL,
      hash TEXT NOT NULL,
      metadata TEXT,
      syncedAt INTEGER NOT NULL
    );
  `);
  
  db.execSync(`
    CREATE TABLE IF NOT EXISTS clouds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service TEXT NOT NULL,
      token TEXT NOT NULL,
      lastSync INTEGER
    );
  `);
  
  db.execSync(`
    CREATE TABLE IF NOT EXISTS sync_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cloudId INTEGER NOT NULL,
      filters TEXT,
      FOREIGN KEY (cloudId) REFERENCES clouds (id)
    );
  `);
};

export const insertMedia = (media) => {
  const result = db.runSync(
    'INSERT INTO media (cloudId, source, localPath, hash, metadata, syncedAt) VALUES (?, ?, ?, ?, ?, ?)',
    [media.cloudId, media.source, media.localPath, media.hash, JSON.stringify(media.metadata), media.syncedAt]
  );
  return result;
};

export const getMediaBySource = (source) => {
  const result = db.getAllSync(
    'SELECT id, cloudId, source, localPath, hash, metadata, syncedAt FROM media WHERE source = ?',
    [source]
  );
  return result;
};

export const getAllMedia = () => {
  const result = db.getAllSync(
    'SELECT id, cloudId, source, localPath, hash, metadata, syncedAt FROM media ORDER BY syncedAt DESC'
  );
  return result;
};

export const insertCloud = (cloud) => {
  const result = db.runSync(
    'INSERT INTO clouds (service, token, lastSync) VALUES (?, ?, ?)',
    [cloud.service, cloud.token, Date.now()]
  );
  return result;
};

export const getClouds = () => {
  const result = db.getAllSync('SELECT id, service, token, lastSync FROM clouds');
  return result;
};

export const deleteCloud = (id) => {
  const result = db.runSync('DELETE FROM clouds WHERE id = ?', [id]);
  return result;
};
