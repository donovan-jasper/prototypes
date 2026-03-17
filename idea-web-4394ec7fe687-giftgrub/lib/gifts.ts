import * as SQLite from 'expo-sqlite';
import { Gift, SentGift } from '../types';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase() {
  if (!db) {
    db = await SQLite.openDatabaseAsync('giftswift.db');
  }
  return db;
}

export async function createGift(data: Omit<Gift, 'id' | 'createdAt'>): Promise<Gift> {
  const database = await getDatabase();
  const result = await database.runAsync(
    `INSERT INTO gifts (title, category, price, description, imageUrl) VALUES (?, ?, ?, ?, ?)`,
    [data.title, data.category, data.price, data.description || '', data.imageUrl || '']
  );

  return {
    id: result.lastInsertRowId,
    ...data,
    createdAt: new Date().toISOString(),
  };
}

export async function getGiftById(id: number): Promise<Gift | null> {
  const database = await getDatabase();
  const result = await database.getFirstAsync<Gift>(
    `SELECT * FROM gifts WHERE id = ?`,
    [id]
  );
  return result || null;
}

export async function getGiftsByCategory(category: string): Promise<Gift[]> {
  const database = await getDatabase();
  const results = await database.getAllAsync<Gift>(
    `SELECT * FROM gifts WHERE category = ? ORDER BY createdAt DESC`,
    [category]
  );
  return results;
}

export async function getAllGifts(): Promise<Gift[]> {
  const database = await getDatabase();
  const results = await database.getAllAsync<Gift>(
    `SELECT * FROM gifts ORDER BY createdAt DESC`
  );
  return results;
}

export async function searchGifts(query: string): Promise<Gift[]> {
  const database = await getDatabase();
  const searchTerm = `%${query}%`;
  const results = await database.getAllAsync<Gift>(
    `SELECT * FROM gifts WHERE title LIKE ? OR description LIKE ? ORDER BY createdAt DESC`,
    [searchTerm, searchTerm]
  );
  return results;
}

export async function createSentGift(data: {
  giftId: number;
  recipientId: number;
  message: string;
  status: string;
}): Promise<SentGift> {
  const database = await getDatabase();
  const sentAt = new Date().toISOString();
  
  const result = await database.runAsync(
    `INSERT INTO sent_gifts (giftId, recipientId, message, status, sentAt) VALUES (?, ?, ?, ?, ?)`,
    [data.giftId, data.recipientId, data.message, data.status, sentAt]
  );

  return {
    id: result.lastInsertRowId,
    ...data,
    sentAt,
    redeemedAt: null,
  };
}

export async function getSentGifts(): Promise<SentGift[]> {
  const database = await getDatabase();
  const results = await database.getAllAsync<SentGift>(
    `SELECT * FROM sent_gifts ORDER BY sentAt DESC`
  );
  return results;
}

export async function getSentGiftById(id: number): Promise<SentGift | null> {
  const database = await getDatabase();
  const result = await database.getFirstAsync<SentGift>(
    `SELECT * FROM sent_gifts WHERE id = ?`,
    [id]
  );
  return result || null;
}

export async function updateSentGiftStatus(id: number, status: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `UPDATE sent_gifts SET status = ? WHERE id = ?`,
    [status, id]
  );
}

export async function markGiftAsRedeemed(id: number): Promise<void> {
  const database = await getDatabase();
  const redeemedAt = new Date().toISOString();
  await database.runAsync(
    `UPDATE sent_gifts SET status = 'redeemed', redeemedAt = ? WHERE id = ?`,
    [redeemedAt, id]
  );
}
