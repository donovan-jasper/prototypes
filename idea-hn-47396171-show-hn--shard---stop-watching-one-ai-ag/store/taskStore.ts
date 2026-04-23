import { create } from 'zustand';
import { Task, TaskStatus, UserSubscription } from '../types';
import { TaskQueue } from '../lib/taskQueue';
import { Database } from '../lib/database';
import { NotificationManager } from '../lib/notifications';
import { BackgroundTaskManager } from '../lib/backgroundTaskManager';

interface TaskStore {
  tasks: Task[];
  queue: TaskQueue;
  db: Database;
  subscription: UserSubscription;
  notificationManager: NotificationManager;
  backgroundTaskManager: BackgroundTaskManager | null;

  initialize: () => Promise<void>;
  addTask: (prompt: string, templateId?: string) => void;
  cancelTask: (id: string) => void;
  loadHistory: () => Promise<void>;
  updateSubscription: (subscription: UserSubscription) => void;
  checkNotificationPermissions: () => Promise<boolean>;
  requestNotificationPermissions: () => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  queue: new TaskQueue(2),
  db: new Database(),
  notificationManager: NotificationManager.getInstance(),
  backgroundTaskManager: null,
  subscription: {
    isPro: false,
    maxParallelTasks: 2,
    dailyTaskLimit: 10,
    historyRetentionDays: 7,
  },

  initialize: async () => {
    const { db, notificationManager, queue } = get();
    await db.initialize();
    await get().loadHistory();

    // Initialize background task manager
    const backgroundTaskManager = new BackgroundTaskManager(queue);
    set({ backgroundTaskManager });

    // Check notification permissions on app start
    const hasPermission = await notificationManager.checkNotificationPermissions();
    if (!hasPermission) {
      await notificationManager.requestNotificationPermissions();
    }
  },

  addTask: (prompt: string, templateId?: string) => {
    const { queue, db, tasks, notificationManager } = get();
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

  checkNotificationPermissions: async () => {
    const { notificationManager } = get();
    return await notificationManager.checkNotificationPermissions();
  },

  requestNotificationPermissions: async () => {
    const { notificationManager } = get();
    const granted = await notificationManager.requestNotificationPermissions();
    if (!granted) {
      // Handle case where user denied permission
      console.log('Notification permission denied');
    }
  },
}));
