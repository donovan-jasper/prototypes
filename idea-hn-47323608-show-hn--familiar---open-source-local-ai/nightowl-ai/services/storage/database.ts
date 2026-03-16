import * as SQLite from 'expo-sqlite';
import { Task } from '@/types';

export class Database {
  private db: SQLite.WebSQLDatabase | null = null;

  async init(): Promise<void> {
    this.db = SQLite.openDatabase('nightowl.db');

    await this.runMigrations();
  }

  async runMigrations(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    // Create tables if they don't exist
    await this.executeSql(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        status TEXT NOT NULL,
        progress REAL,
        files_processed INTEGER,
        created_at INTEGER NOT NULL,
        completed_at INTEGER,
        error TEXT
      );
    `);

    await this.executeSql(`
      CREATE TABLE IF NOT EXISTS files (
        id TEXT PRIMARY KEY,
        uri TEXT NOT NULL,
        type TEXT NOT NULL,
        category TEXT,
        task_id TEXT,
        FOREIGN KEY (task_id) REFERENCES tasks (id)
      );
    `);

    await this.executeSql(`
      CREATE TABLE IF NOT EXISTS processed_content (
        id TEXT PRIMARY KEY,
        file_id TEXT NOT NULL,
        content TEXT,
        summary TEXT,
        entities TEXT,
        FOREIGN KEY (file_id) REFERENCES files (id)
      );
    `);

    // Add indexes for performance
    await this.executeSql('CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks (status);');
    await this.executeSql('CREATE INDEX IF NOT EXISTS idx_files_category ON files (category);');
  }

  async createTask(task: Omit<Task, 'id'>): Promise<Task> {
    const id = this.generateId();
    const createdAt = Date.now();

    await this.executeSql(
      'INSERT INTO tasks (id, type, status, progress, files_processed, created_at, completed_at, error) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, task.type, task.status, task.progress, task.filesProcessed, createdAt, task.completedAt, task.error]
    );

    return { ...task, id, createdAt };
  }

  async getTask(id: string): Promise<Task | null> {
    const result = await this.executeSql('SELECT * FROM tasks WHERE id = ?', [id]);
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapTask(result.rows.item(0));
  }

  async getPendingTasks(): Promise<Task[]> {
    const result = await this.executeSql('SELECT * FROM tasks WHERE status = ?', ['pending']);
    return result.rows._array.map(this.mapTask);
  }

  async updateTaskStatus(id: string, status: string, completedAt?: number): Promise<void> {
    await this.executeSql(
      'UPDATE tasks SET status = ?, completed_at = ? WHERE id = ?',
      [status, completedAt || Date.now(), id]
    );
  }

  async updateTaskProgress(id: string, progress: number, filesProcessed?: number): Promise<void> {
    await this.executeSql(
      'UPDATE tasks SET progress = ?, files_processed = ? WHERE id = ?',
      [progress, filesProcessed, id]
    );
  }

  async clear(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    await this.executeSql('DELETE FROM tasks');
    await this.executeSql('DELETE FROM files');
    await this.executeSql('DELETE FROM processed_content');
  }

  private executeSql(sql: string, params: any[] = []): Promise<SQLite.SQLResultSet> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.transaction(tx => {
        tx.executeSql(
          sql,
          params,
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      });
    });
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private mapTask(row: any): Task {
    return {
      id: row.id,
      type: row.type,
      status: row.status,
      progress: row.progress,
      filesProcessed: row.files_processed,
      createdAt: row.created_at,
      completedAt: row.completed_at,
      error: row.error,
    };
  }
}
