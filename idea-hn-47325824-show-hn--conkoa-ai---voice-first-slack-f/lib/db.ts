import * as SQLite from 'expo-sqlite';
import { Message, Task } from '../types'; // Import Message and Task types

export const db = SQLite.openDatabaseSync('voxcrew.db');

export async function initDatabase() {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      channel_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      text TEXT NOT NULL,
      audio_url TEXT,
      timestamp INTEGER NOT NULL,
      synced INTEGER DEFAULT 1, -- 0 for pending, 1 for synced
      version INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      due_date INTEGER,
      completed INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS pending_messages (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_messages_channel ON messages(channel_id);
    CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
  `);
}

export async function saveMessage(message: Message, isSynced: boolean = false) {
  await db.runAsync(
    'INSERT INTO messages (id, channel_id, user_id, text, audio_url, timestamp, synced, version) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [message.id, message.channelId, message.userId, message.text, message.audioUrl || null, message.timestamp, isSynced ? 1 : 0, message.version || 1]
  );
}

export async function getMessages(channelId: string): Promise<Message[]> {
  const result = await db.getAllAsync(
    'SELECT id, channel_id as channelId, user_id as userId, text, audio_url as audioUrl, timestamp, synced, version FROM messages WHERE channel_id = ? ORDER BY timestamp DESC LIMIT 100',
    [channelId]
  );
  return result.map((row: any) => ({
    ...row,
    synced: row.synced === 1, // Convert INTEGER to boolean
  }));
}

export async function updateMessageSyncedStatus(messageId: string, synced: boolean) {
  await db.runAsync(
    'UPDATE messages SET synced = ? WHERE id = ?',
    [synced ? 1 : 0, messageId]
  );
}

export async function getPendingMessagesCount(): Promise<number> {
  const result = await db.getFirstAsync('SELECT COUNT(*) as count FROM pending_messages');
  return result ? result.count : 0;
}

// Placeholder for saveTask and getTasks, assuming they exist based on spec
export async function saveTask(task: Task) {
  await db.runAsync(
    'INSERT INTO tasks (id, title, description, due_date, completed, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [task.id, task.title, task.description || null, task.dueDate || null, task.completed ? 1 : 0, task.createdAt]
  );
}

export async function getTasks(): Promise<Task[]> {
  const result = await db.getAllAsync(
    'SELECT id, title, description, due_date as dueDate, completed, created_at as createdAt FROM tasks ORDER BY created_at DESC'
  );
  return result.map((row: any) => ({
    ...row,
    completed: row.completed === 1,
  }));
}

export async function updateMessageText(messageId: string, newText: string) {
  await db.runAsync(
    'UPDATE messages SET text = ? WHERE id = ?',
    [newText, messageId]
  );
}
