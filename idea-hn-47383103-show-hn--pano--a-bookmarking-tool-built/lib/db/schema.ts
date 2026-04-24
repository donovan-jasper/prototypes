import * as SQLite from 'expo-sqlite';

export interface Shelf {
  id: number;
  name: string;
  description: string | null;
  cover_image: string | null;
  created_at: string;
  updated_at: string;
  order_index: number;
  view_count: number | null;
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

export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync('shelflife.db');

  // Create tables if they don't exist
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS shelves (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      cover_image TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      order_index INTEGER NOT NULL,
      view_count INTEGER DEFAULT 0
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

    CREATE INDEX IF NOT EXISTS idx_items_shelf_id ON items(shelf_id);
    CREATE INDEX IF NOT EXISTS idx_items_url ON items(url);
    CREATE INDEX IF NOT EXISTS idx_shelves_order ON shelves(order_index);
  `);

  return db;
}
