import * as SQLite from 'expo-sqlite';
import { MediaItem } from '../types';

const db = SQLite.openDatabase('mediamesh.db');

export const initDatabase = async () => {
  return new Promise<void>((resolve, reject) => {
    db.transaction(
      (tx) => {
        // Create media table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS media (
            id TEXT PRIMARY KEY,
            cloudId TEXT,
            source TEXT,
            localPath TEXT,
            hash TEXT,
            metadata TEXT,
            syncedAt INTEGER
          );`
        );

        // Create clouds table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS clouds (
            id TEXT PRIMARY KEY,
            service TEXT,
            token TEXT,
            lastSync INTEGER
          );`
        );

        // Create sync_rules table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS sync_rules (
            id TEXT PRIMARY KEY,
            cloudId TEXT,
            filters TEXT
          );`
        );
      },
      (error) => {
        console.error('Database initialization failed:', error);
        reject(error);
      },
      () => {
        resolve();
      }
    );
  });
};

export const insertMedia = async (media: MediaItem) => {
  return new Promise<void>((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `INSERT OR REPLACE INTO media (id, cloudId, source, localPath, hash, metadata, syncedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?);`,
          [
            media.id,
            media.cloudId,
            media.source,
            media.localPath,
            media.hash,
            JSON.stringify(media.metadata || {}),
            Date.now(),
          ],
          () => resolve(),
          (_, error) => reject(error)
        );
      },
      (error) => {
        console.error('Error inserting media:', error);
        reject(error);
      }
    );
  });
};

export const getAllMedia = async (): Promise<MediaItem[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT * FROM media ORDER BY syncedAt DESC;`,
          [],
          (_, { rows }) => {
            const media: MediaItem[] = rows._array.map((item) => ({
              ...item,
              metadata: item.metadata ? JSON.parse(item.metadata) : {},
            }));
            resolve(media);
          },
          (_, error) => reject(error)
        );
      },
      (error) => {
        console.error('Error getting media:', error);
        reject(error);
      }
    );
  });
};

export const getMediaBySource = async (source: string): Promise<MediaItem[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT * FROM media WHERE source = ? ORDER BY syncedAt DESC;`,
          [source],
          (_, { rows }) => {
            const media: MediaItem[] = rows._array.map((item) => ({
              ...item,
              metadata: item.metadata ? JSON.parse(item.metadata) : {},
            }));
            resolve(media);
          },
          (_, error) => reject(error)
        );
      },
      (error) => {
        console.error('Error getting media by source:', error);
        reject(error);
      }
    );
  });
};

export const deleteMedia = async (id: string) => {
  return new Promise<void>((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `DELETE FROM media WHERE id = ?;`,
          [id],
          () => resolve(),
          (_, error) => reject(error)
        );
      },
      (error) => {
        console.error('Error deleting media:', error);
        reject(error);
      }
    );
  });
};

export const getDuplicates = async (): Promise<MediaItem[][]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT * FROM media WHERE hash IN (
            SELECT hash FROM media GROUP BY hash HAVING COUNT(*) > 1
          ) ORDER BY hash, syncedAt DESC;`,
          [],
          (_, { rows }) => {
            const duplicates: MediaItem[][] = [];
            const hashMap: Record<string, MediaItem[]> = {};

            rows._array.forEach((item) => {
              const mediaItem = {
                ...item,
                metadata: item.metadata ? JSON.parse(item.metadata) : {},
              };

              if (!hashMap[item.hash]) {
                hashMap[item.hash] = [];
              }
              hashMap[item.hash].push(mediaItem);
            });

            Object.values(hashMap).forEach((group) => {
              if (group.length > 1) {
                duplicates.push(group);
              }
            });

            resolve(duplicates);
          },
          (_, error) => reject(error)
        );
      },
      (error) => {
        console.error('Error getting duplicates:', error);
        reject(error);
      }
    );
  });
};
