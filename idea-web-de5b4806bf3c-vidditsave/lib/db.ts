import * as SQLite from 'expo-sqlite';
import { SavedItem, Collection } from '@/types';

let db: SQLite.SQLiteDatabase;

export async function initDB() {
  db = await SQLite.openDatabaseAsync('savestack.db');
  
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      fileUri TEXT,
      thumbnailUri TEXT,
      source TEXT,
      createdAt INTEGER NOT NULL,
      collectionId INTEGER,
      duration INTEGER,
      fileSize INTEGER
    );
    
    CREATE TABLE IF NOT EXISTS collections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      createdAt INTEGER NOT NULL
    );
    
    CREATE INDEX IF NOT EXISTS idx_items_type ON items(type);
    CREATE INDEX IF NOT EXISTS idx_items_collection ON items(collectionId);
  `);
}

export async function addItem(item: Omit<SavedItem, 'id'>): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO items (url, title, type, fileUri, thumbnailUri, source, createdAt, collectionId, duration, fileSize)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      item.url,
      item.title,
      item.type,
      item.fileUri || null,
      item.thumbnailUri || null,
      item.source,
      item.createdAt,
      item.collectionId || null,
      item.duration || null,
      item.fileSize || null
    ]
  );
  return result.lastInsertRowId;
}

export async function getItems(filter?: { type?: string; collectionId?: number; search?: string }): Promise<SavedItem[]> {
  let query = 'SELECT * FROM items WHERE 1=1';
  const params: any[] = [];
  
  if (filter?.type) {
    query += ' AND type = ?';
    params.push(filter.type);
  }
  
  if (filter?.collectionId !== undefined) {
    query += ' AND collectionId = ?';
    params.push(filter.collectionId);
  }
  
  if (filter?.search) {
    query += ' AND (title LIKE ? OR source LIKE ?)';
    const searchTerm = `%${filter.search}%`;
    params.push(searchTerm, searchTerm);
  }
  
  query += ' ORDER BY createdAt DESC';
  
  const result = await db.getAllAsync<SavedItem>(query, params);
  return result;
}

export async function getItemById(id: number): Promise<SavedItem | null> {
  const result = await db.getFirstAsync<SavedItem>(
    'SELECT * FROM items WHERE id = ?',
    [id]
  );
  return result || null;
}

export async function updateItem(id: number, updates: Partial<SavedItem>): Promise<void> {
  const fields: string[] = [];
  const values: any[] = [];
  
  Object.entries(updates).forEach(([key, value]) => {
    if (key !== 'id') {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  });
  
  if (fields.length === 0) return;
  
  values.push(id);
  await db.runAsync(
    `UPDATE items SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
}

export async function deleteItem(id: number): Promise<void> {
  await db.runAsync('DELETE FROM items WHERE id = ?', [id]);
}

export async function addCollection(name: string, color: string): Promise<number> {
  const result = await db.runAsync(
    'INSERT INTO collections (name, color, createdAt) VALUES (?, ?, ?)',
    [name, color, Date.now()]
  );
  return result.lastInsertRowId;
}

export async function getCollections(): Promise<Collection[]> {
  const result = await db.getAllAsync<Collection>(
    'SELECT * FROM collections ORDER BY createdAt DESC'
  );
  return result;
}

export async function deleteCollection(id: number): Promise<void> {
  await db.runAsync('UPDATE items SET collectionId = NULL WHERE collectionId = ?', [id]);
  await db.runAsync('DELETE FROM collections WHERE id = ?', [id]);
}
