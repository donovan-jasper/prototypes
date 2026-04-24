import * as SQLite from 'expo-sqlite';
import { Friend, Interaction, Streak, Challenge } from '@/types';

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase() {
  db = await SQLite.openDatabaseAsync('bondbuddy.db');

  // Create tables if they don't exist
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS friends (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      lastContact TEXT,
      connectionScore INTEGER DEFAULT 0,
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
      targetCount INTEGER DEFAULT 1,
      progress INTEGER DEFAULT 0,
      completed INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      isPremium INTEGER DEFAULT 0,
      monthlyFreezeUsed INTEGER DEFAULT 0,
      lastFreezeReset TEXT
    );
  `);

  // Initialize user settings if not exists
  const settings = await db.getFirstAsync<{ id: number }>('SELECT id FROM user_settings LIMIT 1');
  if (!settings) {
    await db.runAsync('INSERT INTO user_settings (isPremium, monthlyFreezeUsed) VALUES (0, 0)');
  }
}

export async function addFriend(friend: Omit<Friend, 'id' | 'createdAt'>): Promise<number> {
  if (!db) throw new Error('Database not initialized');

  const result = await db.runAsync(
    'INSERT INTO friends (name, phone, email, lastContact, connectionScore) VALUES (?, ?, ?, ?, ?)',
    [friend.name, friend.phone, friend.email || null, friend.lastContact || null, friend.connectionScore]
  );

  // Initialize streak for new friend
  await db.runAsync(
    'INSERT INTO streaks (friendId, currentDays, longestDays, lastInteraction, freezeUsed) VALUES (?, 0, 0, NULL, 0)',
    [result.lastInsertRowId]
  );

  return result.lastInsertRowId;
}

export async function updateFriend(id: number, updates: Partial<Omit<Friend, 'id' | 'createdAt'>>): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }

  if (fields.length === 0) return;

  values.push(id);

  await db.runAsync(
    `UPDATE friends SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
}

export async function getAllFriends(): Promise<Friend[]> {
  if (!db) throw new Error('Database not initialized');

  const friends = await db.getAllAsync<Friend>('SELECT * FROM friends ORDER BY name');
  return friends;
}

export async function getFriendById(id: number): Promise<Friend | null> {
  if (!db) throw new Error('Database not initialized');

  const friend = await db.getFirstAsync<Friend>('SELECT * FROM friends WHERE id = ?', [id]);
  return friend || null;
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
  const newScore = calculateConnectionScore(date);

  await db.runAsync(
    'UPDATE friends SET lastContact = ?, connectionScore = ? WHERE id = ?',
    [date, newScore, friendId]
  );

  // Update streak information
  const longestDays = Math.max(currentStreak.longestDays, updatedStreakDays);

  await db.runAsync(
    `UPDATE streaks SET
      currentDays = ?,
      longestDays = ?,
      lastInteraction = ?,
      freezeUsed = ?
    WHERE friendId = ?`,
    [
      updatedStreakDays,
      longestDays,
      date,
      freezeUsed ? 1 : 0,
      friendId
    ]
  );

  return result.lastInsertRowId;
}

export async function getAllInteractions(): Promise<Interaction[]> {
  if (!db) throw new Error('Database not initialized');

  const interactions = await db.getAllAsync<Interaction>(
    'SELECT * FROM interactions ORDER BY date DESC'
  );

  return interactions;
}

export async function getInteractionsByFriendId(friendId: number): Promise<Interaction[]> {
  if (!db) throw new Error('Database not initialized');

  const interactions = await db.getAllAsync<Interaction>(
    'SELECT * FROM interactions WHERE friendId = ? ORDER BY date DESC',
    [friendId]
  );

  return interactions;
}

export async function getStreakByFriendId(friendId: number): Promise<Streak | null> {
  if (!db) throw new Error('Database not initialized');

  const streak = await db.getFirstAsync<Streak>(
    'SELECT * FROM streaks WHERE friendId = ?',
    [friendId]
  );

  return streak || null;
}

export async function freezeStreak(friendId: number): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  // Check if monthly freeze is available
  const settings = await db.getFirstAsync<{ monthlyFreezeUsed: number; lastFreezeReset: string | null }>(
    'SELECT monthlyFreezeUsed, lastFreezeReset FROM user_settings LIMIT 1'
  );

  if (!settings) {
    throw new Error('User settings not found');
  }

  // Check if we need to reset the monthly freeze
  const now = new Date();
  let shouldReset = false;

  if (settings.lastFreezeReset) {
    const lastReset = new Date(settings.lastFreezeReset);
    const daysSinceReset = Math.floor((now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceReset >= 30) {
      shouldReset = true;
    }
  } else {
    shouldReset = true;
  }

  if (shouldReset) {
    await db.runAsync(
      'UPDATE user_settings SET monthlyFreezeUsed = 0, lastFreezeReset = ?',
      [now.toISOString()]
    );
  }

  // Check if freeze is available
  if (settings.monthlyFreezeUsed >= 1 && !shouldReset) {
    throw new Error('Monthly streak freeze already used');
  }

  // Update streak to freeze it
  await db.runAsync(
    'UPDATE streaks SET freezeUsed = 1 WHERE friendId = ?',
    [friendId]
  );

  // Mark freeze as used
  await db.runAsync(
    'UPDATE user_settings SET monthlyFreezeUsed = monthlyFreezeUsed + 1'
  );
}

export async function getUserSettings(): Promise<{ isPremium: boolean; monthlyFreezeUsed: number }> {
  if (!db) throw new Error('Database not initialized');

  const settings = await db.getFirstAsync<{ isPremium: number; monthlyFreezeUsed: number }>(
    'SELECT isPremium, monthlyFreezeUsed FROM user_settings LIMIT 1'
  );

  if (!settings) {
    throw new Error('User settings not found');
  }

  return {
    isPremium: settings.isPremium === 1,
    monthlyFreezeUsed: settings.monthlyFreezeUsed
  };
}

export async function setPremiumStatus(isPremium: boolean): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  await db.runAsync(
    'UPDATE user_settings SET isPremium = ?',
    [isPremium ? 1 : 0]
  );
}

// Helper functions
function calculateConnectionScore(lastContactDate: string | null): number {
  if (!lastContactDate) {
    return 0;
  }

  const now = new Date();
  const lastContact = new Date(lastContactDate);
  const daysSince = Math.floor((now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24));

  // Exponential decay curve for connection score
  if (daysSince <= 7) return 100;
  if (daysSince <= 14) return 80;
  if (daysSince <= 30) return 60;
  if (daysSince <= 60) return 40;
  if (daysSince <= 90) return 20;
  return 0;
}

function calculateStreak(
  lastInteractionDate: string | null,
  currentStreakDays: number,
  freezeStatus: { used: boolean; available: boolean }
): { updatedStreakDays: number; freezeUsed: boolean } {
  const now = new Date();
  const lastInteraction = lastInteractionDate ? new Date(lastInteractionDate) : null;

  // If no previous interaction, start fresh streak
  if (!lastInteraction) {
    return {
      updatedStreakDays: 0,
      freezeUsed: false
    };
  }

  const daysSince = Math.floor((now.getTime() - lastInteraction.getTime()) / (1000 * 60 * 60 * 24));

  // If interaction was today, increment streak
  if (daysSince === 0) {
    return {
      updatedStreakDays: currentStreakDays + 1,
      freezeUsed: false
    };
  }

  // If interaction was yesterday, continue streak
  if (daysSince === 1) {
    return {
      updatedStreakDays: currentStreakDays + 1,
      freezeUsed: false
    };
  }

  // If streak was broken (more than 1 day since last interaction)
  // Check if freeze is available and not used yet
  if (freezeStatus.available && !freezeStatus.used && currentStreakDays > 0) {
    return {
      updatedStreakDays: currentStreakDays,
      freezeUsed: true
    };
  }

  // If freeze is used or not available, reset streak
  return {
    updatedStreakDays: 0,
    freezeUsed: false
  };
}
