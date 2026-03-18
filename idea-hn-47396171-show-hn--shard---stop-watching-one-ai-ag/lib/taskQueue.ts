import { Task, TaskStatus } from '../types';
import { AIProvider } from './aiProvider';

export class TaskQueue {
  private tasks: Map<string, Task> = new Map();
  private runningPromises: Map<string, Promise<void>> = new Map();
  private maxParallel: number;
  private aiProvider: AIProvider;

  constructor(maxParallel: number = 2) {
    this.maxParallel = maxParallel;
    this.aiProvider = new AIProvider();
  }

  addTask(task: Task): void {
    this.tasks.set(task.id, task);
    this.processQueue();
  }

  private async processQueue(): Promise<void> {
    const running = Array.from(this.tasks.values()).filter(
      t => t.status === TaskStatus.RUNNING
    );

    if (running.length >= this.maxParallel) return;

    const pending = Array.from(this.tasks.values())
      .filter(t => t.status === TaskStatus.PENDING)
      .sort((a, b) => a.createdAt - b.createdAt);

    const slotsAvailable = this.maxParallel - running.length;
    const toStart = pending.slice(0, slotsAvailable);

    if (toStart.length === 0) return;

    const promises = toStart.map(task => this.runTask(task));
    
    Promise.race(promises).then(() => {
      this.processQueue();
    });
  }

  private async runTask(task: Task): Promise<void> {
    task.status = TaskStatus.RUNNING;
    task.startedAt = Date.now();
    this.tasks.set(task.id, task);

    const taskPromise = (async () => {
      try {
        const result = await this.aiProvider.execute(
          task.prompt,
          (progress) => {
            task.progress = progress;
            this.tasks.set(task.id, task);
          }
        );

        task.status = TaskStatus.COMPLETED;
        task.result = result;
        task.completedAt = Date.now();
      } catch (error) {
        task.status = TaskStatus.FAILED;
        task.error = error instanceof Error ? error.message : 'Unknown error';
        task.completedAt = Date.now();
      } finally {
        this.tasks.set(task.id, task);
        this.runningPromises.delete(task.id);
      }
    })();

    this.runningPromises.set(task.id, taskPromise);
    return taskPromise;
  }

  cancelTask(id: string): void {
    const task = this.tasks.get(id);
    if (task && task.status === TaskStatus.RUNNING) {
      task.status = TaskStatus.CANCELLED;
      task.completedAt = Date.now();
      this.tasks.set(id, task);
      this.runningPromises.delete(id);
      this.processQueue();
    }
  }

  async completeTask(id: string): Promise<void> {
    const task = this.tasks.get(id);
    if (task) {
      task.status = TaskStatus.COMPLETED;
      task.completedAt = Date.now();
      this.tasks.set(id, task);
      this.runningPromises.delete(id);
      this.processQueue();
    }
  }

  getTask(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  getTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  setMaxParallel(max: number): void {
    this.maxParallel = max;
    this.processQueue();
  }
}
