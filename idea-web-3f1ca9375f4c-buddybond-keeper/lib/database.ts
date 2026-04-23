import * as SQLite from 'expo-sqlite';
import { Friend, Interaction, Reminder, HealthStatus } from './types';

let db: SQLite.SQLiteDatabase;

export async function initDatabase() {
  db = await SQLite.openDatabaseAsync('kinkeeper.db');

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS friends (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      photo TEXT,
      birthday TEXT,
      interests TEXT,
      lastContacted TEXT,
      reminderFrequency TEXT NOT NULL,
      createdAt TEXT NOT NULL
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

    CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      friendId INTEGER NOT NULL,
      dueDate TEXT NOT NULL,
      dismissed INTEGER DEFAULT 0,
      snoozedUntil TEXT,
      FOREIGN KEY (friendId) REFERENCES friends(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS gestures (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      friendId INTEGER NOT NULL,
      text TEXT NOT NULL,
      category TEXT NOT NULL,
      dismissed INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (friendId) REFERENCES friends(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_interactions_friendId ON interactions(friendId);
    CREATE INDEX IF NOT EXISTS idx_interactions_date ON interactions(date);
    CREATE INDEX IF NOT EXISTS idx_reminders_friendId ON reminders(friendId);
    CREATE INDEX IF NOT EXISTS idx_reminders_dueDate ON reminders(dueDate);
  `);
}

export async function getAllFriends(): Promise<Friend[]> {
  const result = await db.getAllAsync<Friend>('SELECT * FROM friends ORDER BY name ASC');
  return result.map(friend => ({
    ...friend,
    interests: friend.interests ? JSON.parse(friend.interests) : [],
    lastContacted: friend.lastContacted ? new Date(friend.lastContacted) : null,
    createdAt: new Date(friend.createdAt)
  }));
}

export async function getInteractionsByFriend(friendId: number): Promise<Interaction[]> {
  const result = await db.getAllAsync<Interaction>(
    'SELECT * FROM interactions WHERE friendId = ? ORDER BY date DESC',
    [friendId]
  );

  return result.map(interaction => ({
    ...interaction,
    date: new Date(interaction.date)
  }));
}

// Other existing functions would be here...
