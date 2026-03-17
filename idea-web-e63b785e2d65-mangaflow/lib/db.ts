import * as SQLite from 'expo-sqlite';
import { Manga } from '../types';

let db: SQLite.SQLiteDatabase | null = null;

export async function initDB() {
  if (db) return db;
  
  db = await SQLite.openDatabaseAsync('pageturn.db');
  
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS manga (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      coverUri TEXT NOT NULL,
      totalPages INTEGER NOT NULL,
      currentPage INTEGER DEFAULT 0,
      readingMode TEXT DEFAULT 'ltr',
      lastRead INTEGER DEFAULT 0,
      isFavorite INTEGER DEFAULT 0
    );
    
    CREATE INDEX IF NOT EXISTS idx_lastRead ON manga(lastRead DESC);
    CREATE INDEX IF NOT EXISTS idx_isFavorite ON manga(isFavorite DESC);
  `);
  
  return db;
}

export async function addManga(manga: Omit<Manga, 'id'>): Promise<string> {
  const database = await initDB();
  const id = `manga-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  await database.runAsync(
    `INSERT INTO manga (id, title, coverUri, totalPages, currentPage, readingMode, lastRead, isFavorite)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      manga.title,
      manga.coverUri,
      manga.totalPages,
      manga.currentPage,
      manga.readingMode,
      manga.lastRead,
      manga.isFavorite ? 1 : 0,
    ]
  );
  
  return id;
}

export async function getMangaById(id: string): Promise<Manga | null> {
  const database = await initDB();
  const result = await database.getFirstAsync<any>(
    'SELECT * FROM manga WHERE id = ?',
    [id]
  );
  
  if (!result) return null;
  
  return {
    ...result,
    isFavorite: result.isFavorite === 1,
  };
}

export async function getAllManga(): Promise<Manga[]> {
  const database = await initDB();
  const results = await database.getAllAsync<any>(
    'SELECT * FROM manga ORDER BY lastRead DESC'
  );
  
  return results.map((row) => ({
    ...row,
    isFavorite: row.isFavorite === 1,
  }));
}

export async function updateMangaProgress(id: string, currentPage: number) {
  const database = await initDB();
  await database.runAsync(
    'UPDATE manga SET currentPage = ?, lastRead = ? WHERE id = ?',
    [currentPage, Date.now(), id]
  );
}

export async function deleteManga(id: string) {
  const database = await initDB();
  await database.runAsync('DELETE FROM manga WHERE id = ?', [id]);
}

export async function getMangaCount(): Promise<number> {
  const database = await initDB();
  const result = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM manga'
  );
  return result?.count || 0;
}
