import * as SQLite from 'expo-sqlite';

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  platform: string;
  status: 'draft' | 'active' | 'sold' | 'expired';
  images: string; // JSON stringified array
  sourcingCost: number;
  createdAt: string;
}

let db: SQLite.SQLiteDatabase | null = null;

export async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;

  db = await SQLite.openDatabaseAsync('sellsync.db');

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS listings (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      platform TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      images TEXT,
      sourcingCost REAL DEFAULT 0,
      createdAt TEXT NOT NULL
    );
  `);

  return db;
}

export async function createListing(listing: Omit<Listing, 'id' | 'createdAt'>): Promise<string> {
  const database = await openDatabase();
  const id = `listing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const createdAt = new Date().toISOString();

  await database.runAsync(
    `INSERT INTO listings (id, title, description, price, platform, status, images, sourcingCost, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, listing.title, listing.description || '', listing.price, listing.platform, listing.status, listing.images || '[]', listing.sourcingCost || 0, createdAt]
  );

  return id;
}

export async function updateListing(id: string, updates: Partial<Omit<Listing, 'id' | 'createdAt'>>): Promise<void> {
  const database = await openDatabase();
  const fields: string[] = [];
  const values: any[] = [];

  Object.entries(updates).forEach(([key, value]) => {
    fields.push(`${key} = ?`);
    values.push(value);
  });

  if (fields.length === 0) return;

  values.push(id);
  await database.runAsync(
    `UPDATE listings SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
}

export async function deleteListing(id: string): Promise<void> {
  const database = await openDatabase();
  await database.runAsync('DELETE FROM listings WHERE id = ?', [id]);
}

export async function getListings(filters?: { status?: string; platform?: string }): Promise<Listing[]> {
  const database = await openDatabase();
  let query = 'SELECT * FROM listings';
  const conditions: string[] = [];
  const values: any[] = [];

  if (filters?.status) {
    conditions.push('status = ?');
    values.push(filters.status);
  }

  if (filters?.platform) {
    conditions.push('platform = ?');
    values.push(filters.platform);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY createdAt DESC';

  const result = await database.getAllAsync<Listing>(query, values);
  return result;
}

export async function getListing(id: string): Promise<Listing | null> {
  const database = await openDatabase();
  const result = await database.getFirstAsync<Listing>(
    'SELECT * FROM listings WHERE id = ?',
    [id]
  );
  return result || null;
}
