import * as SQLite from 'expo-sqlite';

export interface Chapter {
  id?: number;
  audiobookId: number;
  title: string;
  startTime: number;
  endTime: number;
  order: number;
}

export interface Audiobook {
  id?: number;
  title: string;
  author: string;
  duration: number;
  filePath: string;
  coverArt?: string;
  currentPosition?: number;
  createdAt?: string;
  chapters?: Chapter[];
}

export interface Settings {
  id?: number;
  isPremium: boolean;
  lastBackup?: string;
  storageUsage?: number;
}

const db = SQLite.openDatabase('chaptercast.db');

export const initializeDatabase = async () => {
  return new Promise<void>((resolve, reject) => {
    db.transaction(
      (tx) => {
        // Create audiobooks table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS audiobooks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            author TEXT,
            duration INTEGER NOT NULL,
            filePath TEXT NOT NULL,
            coverArt TEXT,
            currentPosition INTEGER DEFAULT 0,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP
          );`
        );

        // Create chapters table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS chapters (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            audiobookId INTEGER NOT NULL,
            title TEXT NOT NULL,
            startTime INTEGER NOT NULL,
            endTime INTEGER NOT NULL,
            "order" INTEGER NOT NULL,
            FOREIGN KEY (audiobookId) REFERENCES audiobooks (id) ON DELETE CASCADE
          );`
        );

        // Create settings table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            isPremium BOOLEAN DEFAULT 0,
            lastBackup TEXT,
            storageUsage INTEGER DEFAULT 0
          );`
        );

        // Initialize settings if empty
        tx.executeSql(
          `INSERT OR IGNORE INTO settings (id, isPremium) VALUES (1, 0);`
        );
      },
      (error) => {
        console.error('Database initialization failed:', error);
        reject(error);
      },
      () => {
        console.log('Database initialized successfully');
        resolve();
      }
    );
  });
};

export const getDatabase = () => db;
