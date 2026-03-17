import * as SQLite from 'expo-sqlite';
import { Media } from '../types';
import { Alert } from 'react-native';

let db: SQLite.SQLiteDatabase | null = null;

const rowToMedia = (row: any): Media => {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    currentProgress: row.current_progress,
    totalProgress: row.total_progress,
    unit: row.unit,
    coverUrl: row.cover_url || undefined,
    linkedFormats: row.linked_formats ? JSON.parse(row.linked_formats) : undefined,
    lastUpdated: new Date(row.last_updated),
    isPremium: row.is_premium === 1,
  };
};

const mediaToRow = (media: Media) => {
  return [
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
  ];
};

export const initDatabase = async () => {
  try {
    db = await SQLite.openDatabaseAsync('pageflow.db');
    
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS media (
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
      );
    `);
  } catch (error) {
    console.error('Database initialization error:', error);
    Alert.alert('Database Error', 'Failed to initialize database. Please restart the app.');
    throw error;
  }
};

export const addMedia = async (media: Media): Promise<void> => {
  try {
    if (!db) throw new Error('Database not initialized');
    
    await db.runAsync(
      'INSERT INTO media (id, title, type, current_progress, total_progress, unit, cover_url, linked_formats, last_updated, is_premium) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      mediaToRow(media)
    );
  } catch (error) {
    console.error('Add media error:', error);
    Alert.alert('Error', 'Failed to add media item. Please try again.');
    throw error;
  }
};

export const updateProgress = async (id: string, progress: number): Promise<void> => {
  try {
    if (!db) throw new Error('Database not initialized');
    
    await db.runAsync(
      'UPDATE media SET current_progress = ?, last_updated = ? WHERE id = ?',
      [progress, new Date().getTime(), id]
    );
  } catch (error) {
    console.error('Update progress error:', error);
    Alert.alert('Error', 'Failed to update progress. Please try again.');
    throw error;
  }
};

export const getMedia = async (id: string): Promise<Media | null> => {
  try {
    if (!db) throw new Error('Database not initialized');
    
    const result = await db.getFirstAsync<any>(
      'SELECT * FROM media WHERE id = ?',
      [id]
    );
    
    return result ? rowToMedia(result) : null;
  } catch (error) {
    console.error('Get media error:', error);
    Alert.alert('Error', 'Failed to retrieve media item.');
    throw error;
  }
};

export const getAllMedia = async (): Promise<Media[]> => {
  try {
    if (!db) throw new Error('Database not initialized');
    
    const rows = await db.getAllAsync<any>('SELECT * FROM media');
    return rows.map(rowToMedia);
  } catch (error) {
    console.error('Get all media error:', error);
    Alert.alert('Error', 'Failed to retrieve media library.');
    return [];
  }
};

export const deleteMedia = async (id: string): Promise<void> => {
  try {
    if (!db) throw new Error('Database not initialized');
    
    await db.runAsync('DELETE FROM media WHERE id = ?', [id]);
  } catch (error) {
    console.error('Delete media error:', error);
    Alert.alert('Error', 'Failed to delete media item. Please try again.');
    throw error;
  }
};

export const getActiveMedia = async (): Promise<Media[]> => {
  try {
    if (!db) throw new Error('Database not initialized');
    
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM media WHERE current_progress < total_progress ORDER BY last_updated DESC'
    );
    return rows.map(rowToMedia);
  } catch (error) {
    console.error('Get active media error:', error);
    Alert.alert('Error', 'Failed to retrieve active media.');
    return [];
  }
};
