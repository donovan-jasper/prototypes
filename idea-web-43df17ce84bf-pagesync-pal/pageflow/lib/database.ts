import * as SQLite from 'expo-sqlite';
import { Media } from '../types';

const db = SQLite.openDatabase('pageflow.db');

export const initDatabase = () => {
  db.transaction((tx) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS media (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        current_progress INTEGER DEFAULT 0,
        total_progress INTEGER NOT NULL,
        unit TEXT NOT NULL,
        cover_url TEXT,
        linked_formats TEXT,
        last_updated INTEGER NOT NULL,
        is_premium INTEGER DEFAULT 0
      );`
    );
  });
};

export const addMedia = (media: Media) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO media (id, title, type, current_progress, total_progress, unit, cover_url, linked_formats, last_updated, is_premium) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          media.id,
          media.title,
          media.type,
          media.currentProgress,
          media.totalProgress,
          media.unit,
          media.coverUrl || null,
          JSON.stringify(media.linkedFormats || []),
          media.lastUpdated.getTime(),
          media.isPremium ? 1 : 0,
        ],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const updateProgress = (id: string, progress: number) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'UPDATE media SET current_progress = ?, last_updated = ? WHERE id = ?',
        [progress, new Date().getTime(), id],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const getMedia = (id: string) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM media WHERE id = ?',
        [id],
        (_, { rows }) => resolve(rows._array[0]),
        (_, error) => reject(error)
      );
    });
  });
};

export const getAllMedia = () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM media',
        [],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

export const deleteMedia = (id: string) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'DELETE FROM media WHERE id = ?',
        [id],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const getActiveMedia = () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM media WHERE current_progress < total_progress ORDER BY last_updated DESC',
        [],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};
