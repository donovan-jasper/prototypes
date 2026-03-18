import * as SQLite from 'expo-sqlite';
import { WardrobeItem, Outfit, WearLogEntry, Category } from '@/types';

let db: SQLite.SQLiteDatabase;

export async function initDatabase() {
  db = await SQLite.openDatabaseAsync('stylesync.db');
  
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      imageUri TEXT NOT NULL,
      category TEXT NOT NULL,
      colors TEXT NOT NULL,
      tags TEXT NOT NULL,
      purchasePrice REAL,
      addedDate TEXT NOT NULL,
      wearCount INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS outfits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      itemIds TEXT NOT NULL,
      createdDate TEXT NOT NULL,
      occasion TEXT
    );

    CREATE TABLE IF NOT EXISTS wear_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      itemId INTEGER,
      outfitId INTEGER,
      wornDate TEXT NOT NULL,
      weather TEXT,
      event TEXT
    );

    CREATE TABLE IF NOT EXISTS user_preferences (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      isPro INTEGER DEFAULT 0,
      favoriteColors TEXT DEFAULT '[]',
      stylePreference TEXT DEFAULT 'mixed',
      onboardingComplete INTEGER DEFAULT 0
    );

    INSERT OR IGNORE INTO user_preferences (id) VALUES (1);
  `);
}

export async function addItem(item: Omit<WardrobeItem, 'id' | 'wearCount'>): Promise<WardrobeItem> {
  const result = await db.runAsync(
    'INSERT INTO items (imageUri, category, colors, tags, purchasePrice, addedDate, wearCount) VALUES (?, ?, ?, ?, ?, ?, 0)',
    item.imageUri,
    item.category,
    JSON.stringify(item.colors),
    JSON.stringify(item.tags),
    item.purchasePrice || null,
    item.addedDate
  );

  return {
    id: result.lastInsertRowId,
    ...item,
    wearCount: 0
  };
}

export async function getItems(category?: Category): Promise<WardrobeItem[]> {
  const query = category 
    ? 'SELECT * FROM items WHERE category = ? ORDER BY addedDate DESC'
    : 'SELECT * FROM items ORDER BY addedDate DESC';
  
  const rows = category 
    ? await db.getAllAsync<any>(query, category)
    : await db.getAllAsync<any>(query);

  return rows.map(row => ({
    id: row.id,
    imageUri: row.imageUri,
    category: row.category,
    colors: JSON.parse(row.colors),
    tags: JSON.parse(row.tags),
    purchasePrice: row.purchasePrice,
    addedDate: row.addedDate,
    wearCount: row.wearCount
  }));
}

export async function getItemById(id: number): Promise<WardrobeItem | null> {
  const row = await db.getFirstAsync<any>('SELECT * FROM items WHERE id = ?', id);
  
  if (!row) return null;

  return {
    id: row.id,
    imageUri: row.imageUri,
    category: row.category,
    colors: JSON.parse(row.colors),
    tags: JSON.parse(row.tags),
    purchasePrice: row.purchasePrice,
    addedDate: row.addedDate,
    wearCount: row.wearCount
  };
}

export async function updateItem(id: number, updates: Partial<WardrobeItem>): Promise<void> {
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.category) {
    fields.push('category = ?');
    values.push(updates.category);
  }
  if (updates.colors) {
    fields.push('colors = ?');
    values.push(JSON.stringify(updates.colors));
  }
  if (updates.tags) {
    fields.push('tags = ?');
    values.push(JSON.stringify(updates.tags));
  }
  if (updates.purchasePrice !== undefined) {
    fields.push('purchasePrice = ?');
    values.push(updates.purchasePrice);
  }
  if (updates.wearCount !== undefined) {
    fields.push('wearCount = ?');
    values.push(updates.wearCount);
  }

  if (fields.length === 0) return;

  values.push(id);
  await db.runAsync(
    `UPDATE items SET ${fields.join(', ')} WHERE id = ?`,
    ...values
  );
}

export async function deleteItem(id: number): Promise<void> {
  await db.runAsync('DELETE FROM items WHERE id = ?', id);
  await db.runAsync('DELETE FROM wear_log WHERE itemId = ?', id);
}

export async function getItemCount(): Promise<number> {
  const result = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM items');
  return result?.count || 0;
}

export async function addOutfit(outfit: Omit<Outfit, 'id'>): Promise<Outfit> {
  const result = await db.runAsync(
    'INSERT INTO outfits (name, itemIds, createdDate, occasion) VALUES (?, ?, ?, ?)',
    outfit.name,
    JSON.stringify(outfit.itemIds),
    outfit.createdDate,
    outfit.occasion || null
  );

  return {
    id: result.lastInsertRowId,
    ...outfit
  };
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

export async function deleteOutfit(id: number): Promise<void> {
  await db.runAsync('DELETE FROM outfits WHERE id = ?', id);
  await db.runAsync('DELETE FROM wear_log WHERE outfitId = ?', id);
}

export async function logWear(entry: Omit<WearLogEntry, 'id'>): Promise<void> {
  await db.runAsync(
    'INSERT INTO wear_log (itemId, outfitId, wornDate, weather, event) VALUES (?, ?, ?, ?, ?)',
    entry.itemId || null,
    entry.outfitId || null,
    entry.wornDate,
    entry.weather || null,
    entry.event || null
  );

  if (entry.itemId) {
    await db.runAsync('UPDATE items SET wearCount = wearCount + 1 WHERE id = ?', entry.itemId);
  }
}

export async function getRecentlyWornItemIds(days: number = 7): Promise<number[]> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const rows = await db.getAllAsync<{ itemId: number }>(
    'SELECT DISTINCT itemId FROM wear_log WHERE itemId IS NOT NULL AND wornDate >= ? ORDER BY wornDate DESC',
    cutoffDate.toISOString()
  );

  return rows.map(row => row.itemId);
}

export async function getUserPreferences() {
  const row = await db.getFirstAsync<any>('SELECT * FROM user_preferences WHERE id = 1');
  
  if (!row) return null;

  return {
    isPro: row.isPro === 1,
    favoriteColors: JSON.parse(row.favoriteColors),
    stylePreference: row.stylePreference,
    onboardingComplete: row.onboardingComplete === 1
  };
}

export async function updateUserPreferences(updates: Partial<any>): Promise<void> {
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.isPro !== undefined) {
    fields.push('isPro = ?');
    values.push(updates.isPro ? 1 : 0);
  }
  if (updates.favoriteColors) {
    fields.push('favoriteColors = ?');
    values.push(JSON.stringify(updates.favoriteColors));
  }
  if (updates.stylePreference) {
    fields.push('stylePreference = ?');
    values.push(updates.stylePreference);
  }
  if (updates.onboardingComplete !== undefined) {
    fields.push('onboardingComplete = ?');
    values.push(updates.onboardingComplete ? 1 : 0);
  }

  if (fields.length === 0) return;

  await db.runAsync(
    `UPDATE user_preferences SET ${fields.join(', ')} WHERE id = 1`,
    ...values
  );
}
