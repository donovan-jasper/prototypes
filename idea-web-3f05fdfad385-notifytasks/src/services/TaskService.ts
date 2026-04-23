import * as SQLite from 'expo-sqlite';
import { Task } from '../types/TaskTypes';

const db = SQLite.openDatabase('aura.db');

export const TaskService = {
  initializeDatabase: async () => {
    return new Promise((resolve, reject) => {
      db.transaction(
        tx => {
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS tasks (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              content TEXT NOT NULL,
              type TEXT NOT NULL CHECK(type IN ('task', 'note', 'reminder')),
              isCompleted INTEGER NOT NULL DEFAULT 0,
              isPinned INTEGER NOT NULL DEFAULT 0,
              createdAt TEXT NOT NULL,
              dueDate TEXT,
              isPremium INTEGER NOT NULL DEFAULT 0
            );`,
            [],
            () => resolve(true),
            (_, error) => reject(error)
          );
        },
        error => reject(error)
      );
    });
  },

  addTask: async (task: Omit<Task, 'id'>): Promise<Task> => {
    return new Promise((resolve, reject) => {
      db.transaction(
        tx => {
          tx.executeSql(
            `INSERT INTO tasks (content, type, isCompleted, isPinned, createdAt, dueDate, isPremium)
             VALUES (?, ?, ?, ?, ?, ?, ?);`,
            [
              task.content,
              task.type,
              task.isCompleted ? 1 : 0,
              task.isPinned ? 1 : 0,
              task.createdAt,
              task.dueDate || null,
              task.isPremium ? 1 : 0
            ],
            (_, result) => {
              resolve({
                ...task,
                id: result.insertId,
                isCompleted: task.isCompleted || false,
                isPinned: task.isPinned || false,
                isPremium: task.isPremium || false
              });
            },
            (_, error) => reject(error)
          );
        },
        error => reject(error)
      );
    });
  },

  getTasks: async (): Promise<Task[]> => {
    return new Promise((resolve, reject) => {
      db.transaction(
        tx => {
          tx.executeSql(
            `SELECT * FROM tasks ORDER BY isPinned DESC, createdAt DESC;`,
            [],
            (_, { rows }) => {
              const tasks: Task[] = [];
              for (let i = 0; i < rows.length; i++) {
                const row = rows.item(i);
                tasks.push({
                  id: row.id,
                  content: row.content,
                  type: row.type as 'task' | 'note' | 'reminder',
                  isCompleted: row.isCompleted === 1,
                  isPinned: row.isPinned === 1,
                  createdAt: row.createdAt,
                  dueDate: row.dueDate || undefined,
                  isPremium: row.isPremium === 1
                });
              }
              resolve(tasks);
            },
            (_, error) => reject(error)
          );
        },
        error => reject(error)
      );
    });
  },

  getTaskById: async (id: number): Promise<Task | null> => {
    return new Promise((resolve, reject) => {
      db.transaction(
        tx => {
          tx.executeSql(
            `SELECT * FROM tasks WHERE id = ?;`,
            [id],
            (_, { rows }) => {
              if (rows.length > 0) {
                const row = rows.item(0);
                resolve({
                  id: row.id,
                  content: row.content,
                  type: row.type as 'task' | 'note' | 'reminder',
                  isCompleted: row.isCompleted === 1,
                  isPinned: row.isPinned === 1,
                  createdAt: row.createdAt,
                  dueDate: row.dueDate || undefined,
                  isPremium: row.isPremium === 1
                });
              } else {
                resolve(null);
              }
            },
            (_, error) => reject(error)
          );
        },
        error => reject(error)
      );
    });
  },

  updateTask: async (id: number, updates: Partial<Task>): Promise<Task> => {
    return new Promise((resolve, reject) => {
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (updates.content !== undefined) {
        updateFields.push('content = ?');
        updateValues.push(updates.content);
      }
      if (updates.type !== undefined) {
        updateFields.push('type = ?');
        updateValues.push(updates.type);
      }
      if (updates.isCompleted !== undefined) {
        updateFields.push('isCompleted = ?');
        updateValues.push(updates.isCompleted ? 1 : 0);
      }
      if (updates.isPinned !== undefined) {
        updateFields.push('isPinned = ?');
        updateValues.push(updates.isPinned ? 1 : 0);
      }
      if (updates.dueDate !== undefined) {
        updateFields.push('dueDate = ?');
        updateValues.push(updates.dueDate || null);
      }
      if (updates.isPremium !== undefined) {
        updateFields.push('isPremium = ?');
        updateValues.push(updates.isPremium ? 1 : 0);
      }

      if (updateFields.length === 0) {
        reject(new Error('No fields to update'));
        return;
      }

      updateValues.push(id);

      db.transaction(
        tx => {
          tx.executeSql(
            `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = ?;`,
            updateValues,
            async () => {
              const updatedTask = await TaskService.getTaskById(id);
              if (updatedTask) {
                resolve(updatedTask);
              } else {
                reject(new Error('Task not found after update'));
              }
            },
            (_, error) => reject(error)
          );
        },
        error => reject(error)
      );
    });
  },

  updateTaskStatus: async (id: number, isCompleted: boolean): Promise<Task> => {
    return TaskService.updateTask(id, { isCompleted });
  },

  deleteTask: async (id: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.transaction(
        tx => {
          tx.executeSql(
            `DELETE FROM tasks WHERE id = ?;`,
            [id],
            () => resolve(),
            (_, error) => reject(error)
          );
        },
        error => reject(error)
      );
    });
  },

  getActiveGlanceableTasks: async (limit: number = 3): Promise<Task[]> => {
    return new Promise((resolve, reject) => {
      db.transaction(
        tx => {
          tx.executeSql(
            `SELECT * FROM tasks
             WHERE isCompleted = 0
             ORDER BY isPinned DESC, createdAt DESC
             LIMIT ?;`,
            [limit],
            (_, { rows }) => {
              const tasks: Task[] = [];
              for (let i = 0; i < rows.length; i++) {
                const row = rows.item(i);
                tasks.push({
                  id: row.id,
                  content: row.content,
                  type: row.type as 'task' | 'note' | 'reminder',
                  isCompleted: row.isCompleted === 1,
                  isPinned: row.isPinned === 1,
                  createdAt: row.createdAt,
                  dueDate: row.dueDate || undefined,
                  isPremium: row.isPremium === 1
                });
              }
              resolve(tasks);
            },
            (_, error) => reject(error)
          );
        },
        error => reject(error)
      );
    });
  }
};
