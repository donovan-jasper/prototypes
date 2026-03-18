import * as SQLite from 'expo-sqlite';

export interface Deck {
  id?: number;
  title: string;
  html: string;
  thumbnail?: string;
  slideCount: number;
  createdAt: number;
  updatedAt: number;
}

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase() {
  if (db) return db;
  
  db = await SQLite.openDatabaseAsync('slideflow.db');
  
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS decks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      html TEXT NOT NULL,
      thumbnail TEXT,
      slideCount INTEGER NOT NULL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      userId TEXT,
      isPremium INTEGER DEFAULT 0,
      apiKey TEXT
    );
    
    INSERT OR IGNORE INTO settings (id, isPremium) VALUES (1, 0);
  `);
  
  return db;
}

export async function saveDeck(deck: Omit<Deck, 'id'>): Promise<number> {
  const database = await initDatabase();
  const result = await database.runAsync(
    `INSERT INTO decks (title, html, thumbnail, slideCount, createdAt, updatedAt) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [deck.title, deck.html, deck.thumbnail || null, deck.slideCount, deck.createdAt, deck.updatedAt]
  );
  return result.lastInsertRowId;
}

export async function getDeck(id: number): Promise<Deck | null> {
  const database = await initDatabase();
  const result = await database.getFirstAsync<Deck>(
    'SELECT * FROM decks WHERE id = ?',
    [id]
  );
  return result || null;
}

export async function listDecks(): Promise<Deck[]> {
  const database = await initDatabase();
  const results = await database.getAllAsync<Deck>(
    'SELECT * FROM decks ORDER BY updatedAt DESC'
  );
  return results;
}

export async function updateDeck(id: number, updates: Partial<Deck>): Promise<void> {
  const database = await initDatabase();
  const fields: string[] = [];
  const values: any[] = [];
  
  if (updates.title !== undefined) {
    fields.push('title = ?');
    values.push(updates.title);
  }
  if (updates.html !== undefined) {
    fields.push('html = ?');
    values.push(updates.html);
  }
  if (updates.thumbnail !== undefined) {
    fields.push('thumbnail = ?');
    values.push(updates.thumbnail);
  }
  if (updates.slideCount !== undefined) {
    fields.push('slideCount = ?');
    values.push(updates.slideCount);
  }
  
  fields.push('updatedAt = ?');
  values.push(Date.now());
  values.push(id);
  
  await database.runAsync(
    `UPDATE decks SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
}

export async function deleteDeck(id: number): Promise<void> {
  const database = await initDatabase();
  await database.runAsync('DELETE FROM decks WHERE id = ?', [id]);
}

export async function getSettings(): Promise<{ isPremium: boolean; apiKey?: string }> {
  const database = await initDatabase();
  const result = await database.getFirstAsync<{ isPremium: number; apiKey?: string }>(
    'SELECT isPremium, apiKey FROM settings WHERE id = 1'
  );
  return {
    isPremium: result?.isPremium === 1,
    apiKey: result?.apiKey,
  };
}

export async function updateSettings(updates: { isPremium?: boolean; apiKey?: string }): Promise<void> {
  const database = await initDatabase();
  const fields: string[] = [];
  const values: any[] = [];
  
  if (updates.isPremium !== undefined) {
    fields.push('isPremium = ?');
    values.push(updates.isPremium ? 1 : 0);
  }
  if (updates.apiKey !== undefined) {
    fields.push('apiKey = ?');
    values.push(updates.apiKey);
  }
  
  values.push(1);
  
  await database.runAsync(
    `UPDATE settings SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
}
