// services/storage/database.ts
import * as SQLite from 'expo-sqlite';
import { Task, TaskType } from '@/types';

const DB_NAME = 'nightowl.db';

export class Database {
  private db: SQLite.SQLiteDatabase | null = null;

  async init(): Promise<void> {
    if (this.db) {
      return;
    }
    this.db = await SQLite.openDatabaseAsync(DB_NAME);
    console.log('Database: Initialized.');
    await this.db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY NOT NULL,
        type TEXT NOT NULL,
        status TEXT NOT NULL,
        progress INTEGER,
        filesProcessed INTEGER,
        createdAt INTEGER NOT NULL,
        completedAt INTEGER,
        error TEXT
      );
    `);
    console.log('Database: Tables checked/created.');
  }

  async clear(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized.');
    }
    await this.db.execAsync('DROP TABLE IF EXISTS tasks;');
    await this.init(); // Re-initialize after clearing
    console.log('Database: Cleared.');
  }

  async createTask(taskData: Omit<Task, 'id'>): Promise<Task> {
    if (!this.db) {
      throw new Error('Database not initialized.');
    }
    const id = `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    await this.db.runAsync(
      'INSERT INTO tasks (id, type, status, createdAt) VALUES (?, ?, ?, ?)',
      id,
      taskData.type,
      taskData.status,
      taskData.createdAt
    );
    console.log(`Database: Task ${id} created.`);
    return { id, ...taskData };
  }

  async getTask(id: string): Promise<Task> {
    if (!this.db) {
      throw new Error('Database not initialized.');
    }
    const result = await this.db.getFirstAsync<Task>('SELECT * FROM tasks WHERE id = ?', id);
    if (!result) {
      throw new Error(`Task with id ${id} not found.`);
    }
    return result;
  }

  async getPendingTasks(): Promise<Task[]> {
    if (!this.db) {
      throw new Error('Database not initialized.');
    }
    const results = await this.db.getAllAsync<Task>(
      "SELECT * FROM tasks WHERE status = 'pending' ORDER BY createdAt ASC"
    );
    console.log(`Database: Found ${results.length} pending tasks.`);
    return results;
  }

  async updateTaskStatus(
    id: string,
    status: 'running' | 'completed' | 'failed',
    completedAt?: number,
    error?: string
  ): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized.');
    }
    await this.db.runAsync(
      'UPDATE tasks SET status = ?, completedAt = ?, error = ? WHERE id = ?',
      status,
      completedAt || null,
      error || null,
      id
    );
    console.log(`Database: Task ${id} status updated to ${status}.`);
  }
}
