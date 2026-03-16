import db from './DatabaseService';
import { Task } from '../types/TaskTypes';
import { AppConstants } from '../constants/AppConstants';

export const TaskService = {
  addTask: async (content: string, type: 'note' | 'task' | 'reminder', dueDate?: Date) => {
    return new Promise<void>((resolve, reject) => {
      db.transaction(
        (tx) => {
          tx.executeSql(
            'INSERT INTO tasks (content, type, dueDate) VALUES (?, ?, ?)',
            [content, type, dueDate ? dueDate.toISOString() : null],
            () => resolve(),
            (_, error) => reject(error)
          );
        },
        (error) => reject(error)
      );
    });
  },

  getTasks: async () => {
    return new Promise<Task[]>((resolve, reject) => {
      db.transaction(
        (tx) => {
          tx.executeSql(
            'SELECT * FROM tasks ORDER BY createdAt DESC',
            [],
            (_, { rows }) => {
              const tasks: Task[] = [];
              for (let i = 0; i < rows.length; i++) {
                tasks.push({
                  id: rows.item(i).id,
                  content: rows.item(i).content,
                  type: rows.item(i).type,
                  isCompleted: rows.item(i).isCompleted === 1,
                  dueDate: rows.item(i).dueDate ? new Date(rows.item(i).dueDate) : undefined,
                  isPinned: rows.item(i).isPinned === 1,
                  createdAt: new Date(rows.item(i).createdAt),
                  updatedAt: new Date(rows.item(i).updatedAt),
                  locationData: rows.item(i).locationData,
                  isPremium: rows.item(i).isPremium === 1,
                });
              }
              resolve(tasks);
            },
            (_, error) => reject(error)
          );
        },
        (error) => reject(error)
      );
    });
  },

  getTaskById: async (id: number) => {
    return new Promise<Task | null>((resolve, reject) => {
      db.transaction(
        (tx) => {
          tx.executeSql(
            'SELECT * FROM tasks WHERE id = ?',
            [id],
            (_, { rows }) => {
              if (rows.length > 0) {
                const item = rows.item(0);
                resolve({
                  id: item.id,
                  content: item.content,
                  type: item.type,
                  isCompleted: item.isCompleted === 1,
                  dueDate: item.dueDate ? new Date(item.dueDate) : undefined,
                  isPinned: item.isPinned === 1,
                  createdAt: new Date(item.createdAt),
                  updatedAt: new Date(item.updatedAt),
                  locationData: item.locationData,
                  isPremium: item.isPremium === 1,
                });
              } else {
                resolve(null);
              }
            },
            (_, error) => reject(error)
          );
        },
        (error) => reject(error)
      );
    });
  },

  updateTask: async (id: number, content: string, type: 'note' | 'task' | 'reminder', dueDate?: Date) => {
    return new Promise<void>((resolve, reject) => {
      db.transaction(
        (tx) => {
          tx.executeSql(
            'UPDATE tasks SET content = ?, type = ?, dueDate = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
            [content, type, dueDate ? dueDate.toISOString() : null, id],
            () => resolve(),
            (_, error) => reject(error)
          );
        },
        (error) => reject(error)
      );
    });
  },

  updateTaskStatus: async (id: number, isCompleted: boolean) => {
    return new Promise<void>((resolve, reject) => {
      db.transaction(
        (tx) => {
          tx.executeSql(
            'UPDATE tasks SET isCompleted = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
            [isCompleted ? 1 : 0, id],
            () => resolve(),
            (_, error) => reject(error)
          );
        },
        (error) => reject(error)
      );
    });
  },

  deleteTask: async (id: number) => {
    return new Promise<void>((resolve, reject) => {
      db.transaction(
        (tx) => {
          tx.executeSql(
            'DELETE FROM tasks WHERE id = ?',
            [id],
            () => resolve(),
            (_, error) => reject(error)
          );
        },
        (error) => reject(error)
      );
    });
  },

  getActiveGlanceableTasks: async () => {
    const tasks = await TaskService.getTasks();
    const activeTasks = tasks.filter((task) => !task.isCompleted);

    // Apply free tier limits
    if (!isPremium) {
      return activeTasks.slice(0, AppConstants.MAX_FREE_GLANCEABLE_TASKS);
    }

    return activeTasks;
  },
};
