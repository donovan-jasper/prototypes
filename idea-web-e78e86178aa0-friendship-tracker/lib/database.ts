import * as SQLite from 'expo-sqlite';
import { calculateStreak } from './scoring';

export interface Friend {
  id: number;
  name: string;
  phone: string;
  email?: string;
  lastContact: string | null;
  connectionScore: number;
  createdAt: string;
}

export interface Interaction {
  id: number;
  friendId: number;
  type: 'call' | 'text' | 'hangout' | 'gift';
  date: string;
  notes?: string;
  photoUri?: string;
}

export interface Streak {
  friendId: number;
  currentDays: number;
  longestDays: number;
  lastInteraction: string | null;
  freezeUsed: boolean;
}

export interface Challenge {
  id: number;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  targetCount: number;
  progress: number;
  completed: boolean;
  createdAt: string;
}

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase(): Promise<void> {
  db = await SQLite.openDatabaseAsync('bondbuddy.db');

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS friends (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      lastContact TEXT,
      connectionScore INTEGER DEFAULT 100,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS interactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      friendId INTEGER NOT NULL,
      type TEXT NOT NULL,
      date TEXT NOT NULL,
      notes TEXT,
      photoUri TEXT,
      FOREIGN KEY (friendId) REFERENCES friends(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS streaks (
      friendId INTEGER PRIMARY KEY,
      currentDays INTEGER DEFAULT 0,
      longestDays INTEGER DEFAULT 0,
      lastInteraction TEXT,
      freezeUsed INTEGER DEFAULT 0,
      FOREIGN KEY (friendId) REFERENCES friends(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS challenges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      type TEXT NOT NULL,
      targetCount INTEGER NOT NULL,
      progress INTEGER DEFAULT 0,
      completed INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

export async function addFriend(name: string, phone: string, email?: string): Promise<number> {
  if (!db) throw new Error('Database not initialized');

  const result = await db.runAsync(
    'INSERT INTO friends (name, phone, email, connectionScore) VALUES (?, ?, ?, 100)',
    [name, phone, email || null]
  );

  await db.runAsync(
    'INSERT INTO streaks (friendId, currentDays, longestDays) VALUES (?, 0, 0)',
    [result.lastInsertRowId]
  );

  return result.lastInsertRowId;
}

export async function getAllFriends(): Promise<Friend[]> {
  if (!db) throw new Error('Database not initialized');

  const friends = await db.getAllAsync<Friend>(
    'SELECT * FROM friends ORDER BY connectionScore ASC, name ASC'
  );

  return friends;
}

export async function getFriendById(id: number): Promise<Friend | null> {
  if (!db) throw new Error('Database not initialized');

  const friend = await db.getFirstAsync<Friend>(
    'SELECT * FROM friends WHERE id = ?',
    [id]
  );

  return friend || null;
}

export async function updateFriend(id: number, updates: Partial<Friend>): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  const fields = Object.keys(updates).filter(k => k !== 'id');
  const values = fields.map(k => updates[k as keyof Friend]);

  const setClause = fields.map(f => `${f} = ?`).join(', ');

  await db.runAsync(
    `UPDATE friends SET ${setClause} WHERE id = ?`,
    [...values, id]
  );
}

export async function deleteFriend(id: number): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  await db.runAsync('DELETE FROM friends WHERE id = ?', [id]);
}

export async function logInteraction(
  friendId: number,
  type: Interaction['type'],
  date: string,
  notes?: string,
  photoUri?: string
): Promise<number> {
  if (!db) throw new Error('Database not initialized');

  // Get current streak information
  const currentStreak = await db.getFirstAsync<Streak>(
    'SELECT * FROM streaks WHERE friendId = ?',
    [friendId]
  );

  if (!currentStreak) {
    throw new Error('No streak record found for this friend');
  }

  // Calculate new streak state
  const { updatedStreakDays, freezeUsed } = calculateStreak(
    currentStreak.lastInteraction,
    currentStreak.currentDays,
    {
      used: currentStreak.freezeUsed === 1,
      available: true // Assuming freeze is always available unless used
    }
  );

  // Insert the interaction
  const result = await db.runAsync(
    'INSERT INTO interactions (friendId, type, date, notes, photoUri) VALUES (?, ?, ?, ?, ?)',
    [friendId, type, date, notes || null, photoUri || null]
  );

  // Update friend's last contact date and connection score
  const connectionScore = calculateConnectionScore(date);
  await db.runAsync(
    'UPDATE friends SET lastContact = ?, connectionScore = ? WHERE id = ?',
    [date, connectionScore, friendId]
  );

  // Update streak information
  const longestDays = Math.max(currentStreak.longestDays, updatedStreakDays);
  await db.runAsync(
    'UPDATE streaks SET currentDays = ?, longestDays = ?, lastInteraction = ?, freezeUsed = ? WHERE friendId = ?',
    [updatedStreakDays, longestDays, date, freezeUsed ? 1 : 0, friendId]
  );

  return result.lastInsertRowId;
}

export async function getStreak(friendId: number): Promise<Streak | null> {
  if (!db) throw new Error('Database not initialized');

  const streak = await db.getFirstAsync<Streak>(
    'SELECT * FROM streaks WHERE friendId = ?',
    [friendId]
  );

  return streak || null;
}

export async function getInteractionsForFriend(friendId: number): Promise<Interaction[]> {
  if (!db) throw new Error('Database not initialized');

  const interactions = await db.getAllAsync<Interaction>(
    'SELECT * FROM interactions WHERE friendId = ? ORDER BY date DESC',
    [friendId]
  );

  return interactions;
}

export async function getAllChallenges(): Promise<Challenge[]> {
  if (!db) throw new Error('Database not initialized');

  const challenges = await db.getAllAsync<Challenge>(
    'SELECT * FROM challenges ORDER BY createdAt DESC'
  );

  return challenges;
}

export async function addChallenge(
  title: string,
  description: string,
  type: Challenge['type'],
  targetCount: number
): Promise<number> {
  if (!db) throw new Error('Database not initialized');

  const result = await db.runAsync(
    'INSERT INTO challenges (title, description, type, targetCount) VALUES (?, ?, ?, ?)',
    [title, description, type, targetCount]
  );

  return result.lastInsertRowId;
}

export async function updateChallengeProgress(id: number, progress: number): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  await db.runAsync(
    'UPDATE challenges SET progress = ? WHERE id = ?',
    [progress, id]
  );
}

export async function completeChallenge(id: number): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  await db.runAsync(
    'UPDATE challenges SET completed = 1 WHERE id = ?',
    [id]
  );
}

export async function getUserSetting(key: string): Promise<string | null> {
  if (!db) throw new Error('Database not initialized');

  const result = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM user_settings WHERE key = ?',
    [key]
  );

  return result?.value || null;
}

export async function setUserSetting(key: string, value: string): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  await db.runAsync(
    'INSERT OR REPLACE INTO user_settings (key, value) VALUES (?, ?)',
    [key, value]
  );
}
