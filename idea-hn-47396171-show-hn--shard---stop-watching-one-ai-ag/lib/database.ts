import * as SQLite from 'expo-sqlite';
import { Task } from '../types';

export class Database {
  private db: SQLite.SQLiteDatabase;

  constructor(dbName: string = 'parallelmind.db') {
    this.db = SQLite.openDatabaseSync(dbName);
  }

  async initialize() {
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        prompt TEXT NOT NULL,
        status TEXT NOT NULL,
        progress REAL,
        result TEXT,
        error TEXT,
        created_at INTEGER NOT NULL,
        started_at INTEGER,
        completed_at INTEGER,
        template_id TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_created_at ON tasks(created_at DESC);
    `);
  }

  async saveTask(task: Task): Promise<void> {
    await this.db.runAsync(
      `INSERT OR REPLACE INTO tasks 
       (id, prompt, status, progress, result, error, created_at, started_at, completed_at, template_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        task.id,
        task.prompt,
        task.status,
        task.progress ?? null,
        task.result ?? null,
        task.error ?? null,
        task.createdAt,
        task.startedAt ?? null,
        task.completedAt ?? null,
        task.templateId ?? null,
      ]
    );
  }

  async getTask(id: string): Promise<Task | null> {
    const result = await this.db.getFirstAsync<any>(
      'SELECT * FROM tasks WHERE id = ?',
      [id]
    );
    return result ? this.mapRowToTask(result) : null;
  }

  async getTaskHistory(limit: number = 50): Promise<Task[]> {
    const results = await this.db.getAllAsync<any>(
      'SELECT * FROM tasks ORDER BY created_at DESC LIMIT ?',
      [limit]
    );
    return results.map(this.mapRowToTask);
  }

  async cleanupOldTasks(retentionDays: number): Promise<void> {
    const cutoffTime = Date.now() - (retentionDays * 24 * 60 * 60 * 1000);
    await this.db.runAsync('DELETE FROM tasks WHERE created_at < ?', [cutoffTime]);
  }

  private mapRowToTask(row: any): Task {
    return {
      id: row.id,
      prompt: row.prompt,
      status: row.status,
      progress: row.progress,
      result: row.result,
      error: row.error,
      createdAt: row.created_at,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      templateId: row.template_id,
    };
  }

  async close() {
    await this.db.closeAsync();
  }
}
