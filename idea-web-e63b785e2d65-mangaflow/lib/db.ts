import * as SQLite from 'expo-sqlite';
import { Manga } from '../types';

const db = SQLite.openDatabase('pageturn.db');

export async function initDB() {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS manga (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            coverUri TEXT NOT NULL,
            totalPages INTEGER NOT NULL,
            currentPage INTEGER DEFAULT 0,
            readingMode TEXT DEFAULT 'ltr',
            lastRead INTEGER DEFAULT 0,
            isFavorite INTEGER DEFAULT 0
          );`
        );
      },
      error => reject(error),
      () => resolve(true)
    );
  });
}

export async function getAllManga(): Promise<Manga[]> {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'SELECT * FROM manga ORDER BY lastRead DESC',
          [],
          (_, { rows }) => {
            const mangaList: Manga[] = [];
            for (let i = 0; i < rows.length; i++) {
              mangaList.push({
                id: rows.item(i).id,
                title: rows.item(i).title,
                coverUri: rows.item(i).coverUri,
                totalPages: rows.item(i).totalPages,
                currentPage: rows.item(i).currentPage,
                readingMode: rows.item(i).readingMode as 'ltr' | 'rtl' | 'vertical',
                lastRead: rows.item(i).lastRead,
                isFavorite: rows.item(i).isFavorite === 1,
              });
            }
            resolve(mangaList);
          }
        );
      },
      error => reject(error)
    );
  });
}

export async function updateMangaProgress(id: string, currentPage: number, lastRead: number) {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'UPDATE manga SET currentPage = ?, lastRead = ? WHERE id = ?',
          [currentPage, lastRead, id]
        );
      },
      error => reject(error),
      () => resolve(true)
    );
  });
}
