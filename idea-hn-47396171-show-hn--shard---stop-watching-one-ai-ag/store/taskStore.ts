import { create } from 'zustand';
import { Task, TaskStatus, UserSubscription } from '../types';
import { TaskQueue } from '../lib/taskQueue';
import { Database } from '../lib/database';

interface TaskStore {
  tasks: Task[];
  queue: TaskQueue;
  db: Database;
  subscription: UserSubscription;
  
  initialize: () => Promise<void>;
  addTask: (prompt: string, templateId?: string) => void;
  cancelTask: (id: string) => void;
  loadHistory: () => Promise<void>;
  updateSubscription: (subscription: UserSubscription) => void;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  queue: new TaskQueue(2),
  db: new Database(),
  subscription: {
    isPro: false,
    maxParallelTasks: 2,
    dailyTaskLimit: 10,
    historyRetentionDays: 7,
  },

  initialize: async () => {
    const { db } = get();
    await db.initialize();
    await get().loadHistory();
  },

  addTask: (prompt: string, templateId?: string) => {
    const { queue, db, tasks } = get();
    const task: Task = {
      id: Date.now().toString(),
      prompt,
      status: TaskStatus.PENDING,
      createdAt: Date.now(),
      templateId,
    };

    queue.addTask(task);
    db.saveTask(task);
    set({ tasks: [...tasks, task] });

    const interval = setInterval(() => {
      const updated = queue.getTask(task.id);
      if (updated) {
        set(state => ({
          tasks: state.tasks.map(t => t.id === task.id ? updated : t)
        }));
        db.saveTask(updated);

        if (updated.status === TaskStatus.COMPLETED || 
            updated.status === TaskStatus.FAILED ||
            updated.status === TaskStatus.CANCELLED) {
          clearInterval(interval);
        }
      }
    }, 500);
  },

  cancelTask: (id: string) => {
    const { queue } = get();
    queue.cancelTask(id);
  },

  loadHistory: async () => {
    const { db } = get();
    const history = await db.getTaskHistory(50);
    set({ tasks: history });
  },

  updateSubscription: (subscription: UserSubscription) => {
    const { queue } = get();
    queue.setMaxParallel(subscription.maxParallelTasks);
    set({ subscription });
  },
}));
