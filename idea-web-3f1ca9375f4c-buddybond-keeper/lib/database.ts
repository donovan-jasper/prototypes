import * as SQLite from 'expo-sqlite';
import { Friend, Interaction, Reminder, HealthStatus } from './types';

let db: SQLite.SQLiteDatabase;

export async function initDatabase() {
  db = await SQLite.openDatabaseAsync('kinkeeper.db');
  
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS friends (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      photoUri TEXT,
      birthday TEXT,
      interests TEXT,
      lastContacted TEXT,
      reminderFrequency INTEGER NOT NULL DEFAULT 30,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS interactions (
      id TEXT PRIMARY KEY,
      friendId TEXT NOT NULL,
      type TEXT NOT NULL,
      date TEXT NOT NULL,
      notes TEXT,
      photoUri TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (friendId) REFERENCES friends(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reminders (
      id TEXT PRIMARY KEY,
      friendId TEXT NOT NULL,
      dueDate TEXT NOT NULL,
      dismissed INTEGER NOT NULL DEFAULT 0,
      snoozedUntil TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (friendId) REFERENCES friends(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_interactions_friendId ON interactions(friendId);
    CREATE INDEX IF NOT EXISTS idx_interactions_date ON interactions(date);
    CREATE INDEX IF NOT EXISTS idx_reminders_friendId ON reminders(friendId);
    CREATE INDEX IF NOT EXISTS idx_reminders_dueDate ON reminders(dueDate);
  `);
}

export async function addFriend(friend: Omit<Friend, 'id' | 'createdAt'>): Promise<Friend> {
  const id = `friend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const createdAt = new Date().toISOString();
  
  const newFriend: Friend = {
    id,
    ...friend,
    createdAt,
  };

  await db.runAsync(
    `INSERT INTO friends (id, name, photoUri, birthday, interests, lastContacted, reminderFrequency, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      newFriend.id,
      newFriend.name,
      newFriend.photoUri || null,
      newFriend.birthday || null,
      newFriend.interests || null,
      newFriend.lastContacted || null,
      newFriend.reminderFrequency,
      newFriend.createdAt,
    ]
  );

  return newFriend;
}

export async function getAllFriends(): Promise<Friend[]> {
  const result = await db.getAllAsync<Friend>('SELECT * FROM friends ORDER BY name ASC');
  return result;
}

export async function getFriendById(id: string): Promise<Friend | null> {
  const result = await db.getFirstAsync<Friend>('SELECT * FROM friends WHERE id = ?', [id]);
  return result || null;
}

export async function updateFriend(id: string, updates: Partial<Friend>): Promise<void> {
  const fields: string[] = [];
  const values: any[] = [];

  Object.entries(updates).forEach(([key, value]) => {
    if (key !== 'id' && key !== 'createdAt') {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  });

  if (fields.length === 0) return;

  values.push(id);
  await db.runAsync(
    `UPDATE friends SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
}

export async function deleteFriend(id: string): Promise<void> {
  await db.runAsync('DELETE FROM friends WHERE id = ?', [id]);
}

export async function logInteraction(interaction: Omit<Interaction, 'id' | 'createdAt'>): Promise<Interaction> {
  const id = `interaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const createdAt = new Date().toISOString();
  
  const newInteraction: Interaction = {
    id,
    ...interaction,
    createdAt,
  };

  await db.runAsync(
    `INSERT INTO interactions (id, friendId, type, date, notes, photoUri, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      newInteraction.id,
      newInteraction.friendId,
      newInteraction.type,
      newInteraction.date,
      newInteraction.notes || null,
      newInteraction.photoUri || null,
      newInteraction.createdAt,
    ]
  );

  await updateFriend(interaction.friendId, { lastContacted: interaction.date });

  return newInteraction;
}

export async function getInteractionsByFriend(friendId: string): Promise<Interaction[]> {
  const result = await db.getAllAsync<Interaction>(
    'SELECT * FROM interactions WHERE friendId = ? ORDER BY date DESC',
    [friendId]
  );
  return result;
}

export async function createReminder(reminder: Omit<Reminder, 'id' | 'createdAt'>): Promise<Reminder> {
  const id = `reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const createdAt = new Date().toISOString();
  
  const newReminder: Reminder = {
    id,
    ...reminder,
    createdAt,
  };

  await db.runAsync(
    `INSERT INTO reminders (id, friendId, dueDate, dismissed, snoozedUntil, createdAt)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      newReminder.id,
      newReminder.friendId,
      newReminder.dueDate,
      newReminder.dismissed ? 1 : 0,
      newReminder.snoozedUntil || null,
      newReminder.createdAt,
    ]
  );

  return newReminder;
}

export async function getUpcomingReminders(): Promise<Reminder[]> {
  const result = await db.getAllAsync<Reminder>(
    'SELECT * FROM reminders WHERE dismissed = 0 ORDER BY dueDate ASC'
  );
  return result;
}

export function calculateHealthScore(friend: Friend): HealthStatus {
  if (!friend.lastContacted) {
    return 'neglected';
  }

  const lastContactDate = new Date(friend.lastContacted);
  const now = new Date();
  const daysSinceContact = Math.floor((now.getTime() - lastContactDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const expectedFrequency = friend.reminderFrequency;
  
  if (daysSinceContact <= expectedFrequency) {
    return 'healthy';
  } else if (daysSinceContact <= expectedFrequency * 1.5) {
    return 'warning';
  } else {
    return 'neglected';
  }
}
