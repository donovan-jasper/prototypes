import * as SQLite from 'expo-sqlite';
import { User, Match, Message, Session } from './types';

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase(): Promise<void> {
  try {
    db = await SQLite.openDatabaseAsync('bridgecircle.db');
    
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        age INTEGER NOT NULL,
        bio TEXT,
        interests TEXT NOT NULL,
        photoUrl TEXT,
        isPremium INTEGER DEFAULT 0,
        createdAt INTEGER NOT NULL,
        availabilityPreference TEXT,
        ageGapPreference INTEGER
      );
      
      CREATE TABLE IF NOT EXISTS matches (
        id TEXT PRIMARY KEY,
        userId1 TEXT NOT NULL,
        userId2 TEXT NOT NULL,
        score REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        createdAt INTEGER NOT NULL,
        initiatorId TEXT,
        FOREIGN KEY (userId1) REFERENCES users(id),
        FOREIGN KEY (userId2) REFERENCES users(id)
      );
      
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        matchId TEXT NOT NULL,
        senderId TEXT NOT NULL,
        receiverId TEXT NOT NULL,
        content TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        read INTEGER DEFAULT 0,
        FOREIGN KEY (matchId) REFERENCES matches(id),
        FOREIGN KEY (senderId) REFERENCES users(id),
        FOREIGN KEY (receiverId) REFERENCES users(id)
      );
      
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        matchId TEXT NOT NULL,
        scheduledAt INTEGER NOT NULL,
        duration INTEGER NOT NULL,
        type TEXT NOT NULL,
        status TEXT DEFAULT 'scheduled',
        createdAt INTEGER NOT NULL,
        FOREIGN KEY (matchId) REFERENCES matches(id)
      );
      
      CREATE INDEX IF NOT EXISTS idx_matches_users ON matches(userId1, userId2);
      CREATE INDEX IF NOT EXISTS idx_messages_match ON messages(matchId);
      CREATE INDEX IF NOT EXISTS idx_sessions_match ON sessions(matchId);
    `);
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

export async function insertUser(user: User): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  
  await db.runAsync(
    `INSERT INTO users (id, name, email, age, bio, interests, photoUrl, isPremium, createdAt, availabilityPreference, ageGapPreference)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      user.id,
      user.name,
      user.email,
      user.age,
      user.bio || null,
      JSON.stringify(user.interests),
      user.photoUrl || null,
      user.isPremium ? 1 : 0,
      user.createdAt,
      user.availabilityPreference || null,
      user.ageGapPreference || null
    ]
  );
}

export async function getUsers(): Promise<User[]> {
  if (!db) throw new Error('Database not initialized');
  
  const rows = await db.getAllAsync<any>('SELECT * FROM users');
  
  return rows.map(row => ({
    id: row.id,
    name: row.name,
    email: row.email,
    age: row.age,
    bio: row.bio,
    interests: JSON.parse(row.interests),
    photoUrl: row.photoUrl,
    isPremium: row.isPremium === 1,
    createdAt: row.createdAt,
    availabilityPreference: row.availabilityPreference,
    ageGapPreference: row.ageGapPreference
  }));
}

export async function getUserById(userId: string): Promise<User | null> {
  if (!db) throw new Error('Database not initialized');
  
  const row = await db.getFirstAsync<any>(
    'SELECT * FROM users WHERE id = ?',
    [userId]
  );
  
  if (!row) return null;
  
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    age: row.age,
    bio: row.bio,
    interests: JSON.parse(row.interests),
    photoUrl: row.photoUrl,
    isPremium: row.isPremium === 1,
    createdAt: row.createdAt,
    availabilityPreference: row.availabilityPreference,
    ageGapPreference: row.ageGapPreference
  };
}

export async function insertMatch(userId1: string, userId2: string, score: number, initiatorId: string): Promise<string> {
  if (!db) throw new Error('Database not initialized');
  
  const matchId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const createdAt = Date.now();
  
  await db.runAsync(
    `INSERT INTO matches (id, userId1, userId2, score, status, createdAt, initiatorId)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [matchId, userId1, userId2, score, 'pending', createdAt, initiatorId]
  );
  
  return matchId;
}

export async function getMatches(userId: string): Promise<Match[]> {
  if (!db) throw new Error('Database not initialized');
  
  const rows = await db.getAllAsync<any>(
    `SELECT * FROM matches 
     WHERE userId1 = ? OR userId2 = ?
     ORDER BY createdAt DESC`,
    [userId, userId]
  );
  
  return rows.map(row => ({
    id: row.id,
    userId1: row.userId1,
    userId2: row.userId2,
    score: row.score,
    status: row.status,
    createdAt: row.createdAt,
    initiatorId: row.initiatorId
  }));
}

export async function updateMatchStatus(matchId: string, status: 'accepted' | 'rejected'): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  
  await db.runAsync(
    'UPDATE matches SET status = ? WHERE id = ?',
    [status, matchId]
  );
}

export async function getMatchByUsers(userId1: string, userId2: string): Promise<Match | null> {
  if (!db) throw new Error('Database not initialized');
  
  const row = await db.getFirstAsync<any>(
    `SELECT * FROM matches 
     WHERE (userId1 = ? AND userId2 = ?) OR (userId1 = ? AND userId2 = ?)`,
    [userId1, userId2, userId2, userId1]
  );
  
  if (!row) return null;
  
  return {
    id: row.id,
    userId1: row.userId1,
    userId2: row.userId2,
    score: row.score,
    status: row.status,
    createdAt: row.createdAt,
    initiatorId: row.initiatorId
  };
}
