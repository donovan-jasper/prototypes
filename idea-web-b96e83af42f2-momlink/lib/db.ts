import * as SQLite from 'expo-sqlite';
import { User, Request } from '../types';

let db: SQLite.SQLiteDatabase;

export async function initDatabase() {
  db = SQLite.openDatabaseSync('parentcircle.db');
  
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      email TEXT,
      latitude REAL,
      longitude REAL,
      trust_score INTEGER DEFAULT 50,
      is_verified INTEGER DEFAULT 0,
      is_premium INTEGER DEFAULT 0,
      completed_exchanges INTEGER DEFAULT 0,
      positive_reviews INTEGER DEFAULT 0,
      negative_reviews INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS requests (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      author_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      status TEXT DEFAULT 'open',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS circles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_by TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS circle_members (
      circle_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      joined_at TEXT DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (circle_id, user_id),
      FOREIGN KEY (circle_id) REFERENCES circles(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      from_user_id TEXT NOT NULL,
      to_user_id TEXT NOT NULL,
      request_id TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (from_user_id) REFERENCES users(id),
      FOREIGN KEY (to_user_id) REFERENCES users(id),
      FOREIGN KEY (request_id) REFERENCES requests(id)
    );

    CREATE INDEX IF NOT EXISTS idx_requests_location ON requests(latitude, longitude);
    CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
  `);
}

export async function createUser(user: Omit<User, 'id' | 'trustScore' | 'createdAt'>) {
  const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await db.runAsync(
    'INSERT INTO users (id, name, phone, email, latitude, longitude, is_verified, is_premium) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, user.name, user.phone, user.email || null, user.latitude, user.longitude, user.isVerified ? 1 : 0, user.isPremium ? 1 : 0]
  );
  return id;
}

export async function getUser(id: string): Promise<User | null> {
  const result = await db.getFirstAsync<any>('SELECT * FROM users WHERE id = ?', [id]);
  if (!result) return null;
  return {
    id: result.id,
    name: result.name,
    phone: result.phone,
    email: result.email,
    latitude: result.latitude,
    longitude: result.longitude,
    trustScore: result.trust_score,
    isVerified: result.is_verified === 1,
    isPremium: result.is_premium === 1,
    createdAt: result.created_at,
  };
}

export async function createRequest(request: Omit<Request, 'id' | 'status' | 'createdAt' | 'authorName' | 'authorTrustScore'>) {
  const id = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await db.runAsync(
    'INSERT INTO requests (id, title, description, latitude, longitude, author_id, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, request.title, request.description, request.latitude, request.longitude, request.authorId, request.expiresAt]
  );
  return id;
}

export async function getRequests(userLat: number, userLon: number, radiusMiles: number): Promise<Request[]> {
  const latDelta = radiusMiles / 69;
  const lonDelta = radiusMiles / (69 * Math.cos(userLat * Math.PI / 180));

  const results = await db.getAllAsync<any>(
    `SELECT r.*, u.name as author_name, u.trust_score as author_trust_score
     FROM requests r
     JOIN users u ON r.author_id = u.id
     WHERE r.status = 'open'
     AND r.latitude BETWEEN ? AND ?
     AND r.longitude BETWEEN ? AND ?
     AND datetime(r.expires_at) > datetime('now')
     ORDER BY r.created_at DESC`,
    [userLat - latDelta, userLat + latDelta, userLon - lonDelta, userLon + lonDelta]
  );

  return results.map(r => ({
    id: r.id,
    title: r.title,
    description: r.description,
    latitude: r.latitude,
    longitude: r.longitude,
    authorId: r.author_id,
    authorName: r.author_name,
    authorTrustScore: r.author_trust_score,
    expiresAt: r.expires_at,
    status: r.status,
    createdAt: r.created_at,
  }));
}

export function getDatabase() {
  return db;
}
