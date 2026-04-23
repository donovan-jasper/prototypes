import * as SQLite from 'expo-sqlite';
import { Task } from '@/types';

const DATABASE_NAME = 'nightowl.db';

export class Database {
  private db: SQLite.WebSQLDatabase;

  constructor() {
    this.db = SQLite.openDatabase(DATABASE_NAME);
  }

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction(
        tx => {
          // Create tasks table
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS tasks (
              id TEXT PRIMARY KEY,
              type TEXT NOT NULL,
              status TEXT NOT NULL,
              progress REAL,
              filesProcessed INTEGER,
              createdAt INTEGER NOT NULL,
              completedAt INTEGER,
              error TEXT
            );`,
            [],
            () => {
              console.log('Database initialized successfully');
              resolve();
            },
            (_, error) => {
              console.error('Error creating tasks table:', error);
              reject(error);
              return false;
            }
          );
        },
        error => {
          console.error('Database initialization failed:', error);
          reject(error);
        }
      );
    });
  }

  async createTask(task: Omit<Task, 'id'>): Promise<string> {
    const id = Date.now().toString();
    return new Promise((resolve, reject) => {
      this.db.transaction(
        tx => {
          tx.executeSql(
            `INSERT INTO tasks (id, type, status, progress, filesProcessed, createdAt, completedAt, error)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
            [
              id,
              task.type,
              task.status,
              task.progress || null,
              task.filesProcessed || null,
              task.createdAt,
              task.completedAt || null,
              task.error || null
            ],
            () => resolve(id),
            (_, error) => {
              console.error('Error creating task:', error);
              reject(error);
              return false;
            }
          );
        },
        error => {
          console.error('Transaction failed:', error);
          reject(error);
        }
      );
    });
  }

  async getTask(id: string): Promise<Task> {
    return new Promise((resolve, reject) => {
      this.db.transaction(
        tx => {
          tx.executeSql(
            'SELECT * FROM tasks WHERE id = ?;',
            [id],
            (_, { rows }) => {
              if (rows.length > 0) {
                resolve(rows.item(0) as Task);
              } else {
                reject(new Error('Task not found'));
              }
            },
            (_, error) => {
              console.error('Error getting task:', error);
              reject(error);
              return false;
            }
          );
        },
        error => {
          console.error('Transaction failed:', error);
          reject(error);
        }
      );
    });
  }

  async getPendingTasks(): Promise<Task[]> {
    return new Promise((resolve, reject) => {
      this.db.transaction(
        tx => {
          tx.executeSql(
            'SELECT * FROM tasks WHERE status = ? ORDER BY createdAt ASC;',
            ['pending'],
            (_, { rows }) => {
              const tasks: Task[] = [];
              for (let i = 0; i < rows.length; i++) {
                tasks.push(rows.item(i) as Task);
              }
              resolve(tasks);
            },
            (_, error) => {
              console.error('Error getting pending tasks:', error);
              reject(error);
              return false;
            }
          );
        },
        error => {
          console.error('Transaction failed:', error);
          reject(error);
        }
      );
    });
  }

  async updateTaskStatus(
    id: string,
    status: 'pending' | 'running' | 'completed' | 'failed',
    completedAt?: number,
    error?: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction(
        tx => {
          tx.executeSql(
            `UPDATE tasks
             SET status = ?, completedAt = ?, error = ?
             WHERE id = ?;`,
            [status, completedAt || null, error || null, id],
            () => resolve(),
            (_, error) => {
              console.error('Error updating task status:', error);
              reject(error);
              return false;
            }
          );
        },
        error => {
          console.error('Transaction failed:', error);
          reject(error);
        }
      );
    });
  }

  async clear(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction(
        tx => {
          tx.executeSql(
            'DELETE FROM tasks;',
            [],
            () => resolve(),
            (_, error) => {
              console.error('Error clearing database:', error);
              reject(error);
              return false;
            }
          );
        },
        error => {
          console.error('Transaction failed:', error);
          reject(error);
        }
      );
    });
  }
}
