import * as SQLite from 'expo-sqlite';

export interface Shelf {
  id: number;
  name: string;
  description: string | null;
  cover_image: string | null;
  created_at: string;
  updated_at: string;
  order_index: number;
}

export interface Item {
  id: number;
  shelf_id: number;
  url: string;
  title: string;
  description: string | null;
  image_url: string | null;
  favicon_url: string | null;
  created_at: string;
  tags: string | null;
}

export interface User {
  id: number;
  email: string;
  premium: number;
  premium_expires_at: string | null;
}

export const initDatabase = async (db: SQLite.SQLiteDatabase) => {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      premium INTEGER DEFAULT 0,
      premium_expires_at TEXT
    );

    CREATE TABLE IF NOT EXISTS shelves (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      cover_image TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      order_index INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shelf_id INTEGER NOT NULL,
      url TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      favicon_url TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      tags TEXT,
      FOREIGN KEY (shelf_id) REFERENCES shelves(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_shelves_order ON shelves(order_index);
    CREATE INDEX IF NOT EXISTS idx_items_shelf ON items(shelf_id);
    CREATE INDEX IF NOT EXISTS idx_items_created ON items(created_at DESC);
  `);
};
