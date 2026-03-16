import { Task } from '@/types';
import { Database } from './database';

export class TaskQueue {
  private database: Database;

  constructor(database: Database) {
    this.database = database;
  }

  async addTask(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
    return this.database.createTask(task);
  }

  async getTasks(): Promise<Task[]> {
    // In a real implementation, you would query the database for all tasks
    // ordered by priority and creation time
    return [];
  }

  async getPendingTasks(): Promise<Task[]> {
    return this.database.getPendingTasks();
  }

  async updateTaskStatus(id: string, status: string): Promise<void> {
    await this.database.updateTaskStatus(id, status);
  }

  async updateTaskProgress(id: string, progress: number, filesProcessed?: number): Promise<void> {
    await this.database.updateTaskProgress(id, progress, filesProcessed);
  }

  async cancelTask(id: string): Promise<void> {
    await this.database.updateTaskStatus(id, 'cancelled');
  }
}
