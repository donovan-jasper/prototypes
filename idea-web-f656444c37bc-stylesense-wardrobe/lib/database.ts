import * as SQLite from 'expo-sqlite';
import { WardrobeItem, Outfit, WearLogEntry, Category } from '@/types';

const db = SQLite.openDatabase('stylesync.db');

export async function initializeDatabase() {
  // Create tables if they don't exist
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      imageUri TEXT NOT NULL,
      category TEXT NOT NULL,
      colors TEXT NOT NULL, -- JSON array of hex colors
      tags TEXT NOT NULL, -- JSON array of tags
      purchasePrice REAL,
      addedDate TEXT NOT NULL,
      wearCount INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS outfits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      itemIds TEXT NOT NULL, -- JSON array of item IDs
      createdDate TEXT NOT NULL,
      occasion TEXT
    );

    CREATE TABLE IF NOT EXISTS wear_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      itemIds TEXT NOT NULL, -- JSON array of item IDs
      wornDate TEXT NOT NULL,
      weather TEXT,
      event TEXT
    );

    CREATE TABLE IF NOT EXISTS user_preferences (
      id INTEGER PRIMARY KEY,
      stylePreference TEXT,
      favoriteColors TEXT, -- JSON array of hex colors
      lastSuggestionDate TEXT
    );

    CREATE TABLE IF NOT EXISTS weather_cache (
      id INTEGER PRIMARY KEY,
      data TEXT NOT NULL,
      expiry TEXT NOT NULL
    );
  `);

  // Initialize user preferences if empty
  const preferences = await db.getFirstAsync<any>('SELECT * FROM user_preferences WHERE id = 1');
  if (!preferences) {
    await db.runAsync(`
      INSERT INTO user_preferences (id, stylePreference, favoriteColors, lastSuggestionDate)
      VALUES (1, 'balanced', '[]', NULL)
    `);
  }
}

export async function getItems(category?: Category): Promise<WardrobeItem[]> {
  let query = 'SELECT * FROM items';
  const params: any[] = [];

  if (category) {
    query += ' WHERE category = ?';
    params.push(category);
  }

  const rows = await db.getAllAsync<any>(query, ...params);

  return rows.map(row => ({
    id: row.id,
    imageUri: row.imageUri,
    category: row.category as Category,
    colors: JSON.parse(row.colors),
    tags: JSON.parse(row.tags),
    purchasePrice: row.purchasePrice,
    addedDate: row.addedDate,
    wearCount: row.wearCount
  }));
}

export async function addItem(item: Omit<WardrobeItem, 'id' | 'wearCount'>): Promise<WardrobeItem> {
  const result = await db.runAsync(
    'INSERT INTO items (imageUri, category, colors, tags, purchasePrice, addedDate) VALUES (?, ?, ?, ?, ?, ?)',
    item.imageUri,
    item.category,
    JSON.stringify(item.colors),
    JSON.stringify(item.tags),
    item.purchasePrice || null,
    new Date().toISOString()
  );

  return {
    id: result.lastInsertRowId,
    ...item,
    wearCount: 0
  };
}

export async function updateItem(id: number, updates: Partial<WardrobeItem>): Promise<void> {
  const fields: string[] = [];
  const params: any[] = [];

  if (updates.category) {
    fields.push('category = ?');
    params.push(updates.category);
  }

  if (updates.colors) {
    fields.push('colors = ?');
    params.push(JSON.stringify(updates.colors));
  }

  if (updates.tags) {
    fields.push('tags = ?');
    params.push(JSON.stringify(updates.tags));
  }

  if (updates.purchasePrice !== undefined) {
    fields.push('purchasePrice = ?');
    params.push(updates.purchasePrice);
  }

  if (fields.length === 0) return;

  params.push(id);
  await db.runAsync(
    `UPDATE items SET ${fields.join(', ')} WHERE id = ?`,
    ...params
  );
}

export async function deleteItem(id: number): Promise<void> {
  await db.runAsync('DELETE FROM items WHERE id = ?', id);
}

export async function getOutfits(): Promise<Outfit[]> {
  const rows = await db.getAllAsync<any>('SELECT * FROM outfits ORDER BY createdDate DESC');

  return rows.map(row => ({
    id: row.id,
    name: row.name,
    itemIds: JSON.parse(row.itemIds),
    createdDate: row.createdDate,
    occasion: row.occasion
  }));
}

export async function addOutfit(outfit: Omit<Outfit, 'id'>): Promise<Outfit> {
  const result = await db.runAsync(
    'INSERT INTO outfits (name, itemIds, createdDate, occasion) VALUES (?, ?, ?, ?)',
    outfit.name || null,
    JSON.stringify(outfit.itemIds),
    new Date().toISOString(),
    outfit.occasion || null
  );

  return {
    id: result.lastInsertRowId,
    ...outfit
  };
}

export async function deleteOutfit(id: number): Promise<void> {
  await db.runAsync('DELETE FROM outfits WHERE id = ?', id);
}

export async function getWearLogForLastDays(days: number): Promise<WearLogEntry[]> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const rows = await db.getAllAsync<any>(
    'SELECT * FROM wear_log WHERE wornDate >= ? ORDER BY wornDate DESC',
    cutoffDate.toISOString()
  );

  return rows.map(row => ({
    id: row.id,
    itemIds: JSON.parse(row.itemIds),
    wornDate: row.wornDate,
    weather: row.weather,
    event: row.event
  }));
}

export async function addWearLogEntry(entry: Omit<WearLogEntry, 'id'>): Promise<WearLogEntry> {
  const result = await db.runAsync(
    'INSERT INTO wear_log (itemIds, wornDate, weather, event) VALUES (?, ?, ?, ?)',
    JSON.stringify(entry.itemIds),
    entry.wornDate,
    entry.weather,
    entry.event
  );

  // Increment wear count for each item
  for (const itemId of entry.itemIds) {
    await db.runAsync(
      'UPDATE items SET wearCount = wearCount + 1 WHERE id = ?',
      itemId
    );
  }

  return {
    id: result.lastInsertRowId,
    ...entry
  };
}

export async function getUserPreferences(): Promise<{
  stylePreference: string;
  favoriteColors: string[];
  lastSuggestionDate: string | null;
}> {
  const row = await db.getFirstAsync<any>('SELECT * FROM user_preferences WHERE id = 1');

  return {
    stylePreference: row.stylePreference,
    favoriteColors: JSON.parse(row.favoriteColors),
    lastSuggestionDate: row.lastSuggestionDate
  };
}

export async function updateUserPreferences(updates: {
  stylePreference?: string;
  favoriteColors?: string[];
  lastSuggestionDate?: string;
}): Promise<void> {
  const fields: string[] = [];
  const params: any[] = [];

  if (updates.stylePreference) {
    fields.push('stylePreference = ?');
    params.push(updates.stylePreference);
  }

  if (updates.favoriteColors) {
    fields.push('favoriteColors = ?');
    params.push(JSON.stringify(updates.favoriteColors));
  }

  if (updates.lastSuggestionDate) {
    fields.push('lastSuggestionDate = ?');
    params.push(updates.lastSuggestionDate);
  }

  if (fields.length === 0) return;

  await db.runAsync(
    `UPDATE user_preferences SET ${fields.join(', ')} WHERE id = 1`,
    ...params
  );
}
