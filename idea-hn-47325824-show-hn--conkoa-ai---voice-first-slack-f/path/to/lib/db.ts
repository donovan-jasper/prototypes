import * as SQLite from 'expo-sqlite';
import { Message, Task } from '../types';

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
      synced INTEGER DEFAULT 1
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
    CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
  `);
}

export async function saveMessage(message: Message) {
  await db.runAsync(
    'INSERT INTO messages (id, channel_id, user_id, text, audio_url, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
    [message.id, message.channelId, message.userId, message.text, message.audioUrl || null, message.timestamp]
  );
}

export async function getMessages(channelId: string): Promise<Message[]> {
  const result = await db.getAllAsync<Message>(
    'SELECT * FROM messages WHERE channel_id = ? ORDER BY timestamp DESC LIMIT 100',
    [channelId]
  );
  return result;
}

export async function saveTask(task: Task) {
  await db.runAsync(
    'INSERT INTO tasks (id, title, description, due_date, completed, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [task.id, task.title, task.description || null, task.dueDate || null, task.completed ? 1 : 0, task.createdAt]
  );
}

export async function getTasks(): Promise<Task[]> {
  const result = await db.getAllAsync<Task>(
    'SELECT id, title, description, due_date as dueDate, completed, created_at as createdAt FROM tasks ORDER BY created_at DESC'
  );
  return result.map(task => ({
    ...task,
    completed: task.completed === 1, // Convert integer back to boolean
  }));
}
