import { create } from 'zustand';
import { Task, ScheduleBlock } from '../types';
import { suggestOptimalTaskTime } from '../lib/scheduler';

interface TaskState {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'completed' | 'createdAt' | 'scheduledFor'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  rescheduleTask: (id: string, scheduledFor: Date) => void;
  clearAll: () => void;
  suggestTimeForTask: (taskId: string, date: Date, commitments: ScheduleBlock[]) => void;
  getTasksForDate: (date: Date) => Task[];
  getOverdueTasks: () => Task[];
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],

  addTask: (task) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      completed: false,
      createdAt: new Date(),
      scheduledFor: null,
    };
    set((state) => ({ tasks: [...state.tasks, newTask] }));
  },

  updateTask: (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    }));
  },

  deleteTask: (id) => {
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    }));
  },

  completeTask: (id) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, completed: true } : t
      ),
    }));
  },

  rescheduleTask: (id, scheduledFor) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, scheduledFor } : t
      ),
    }));
  },

  clearAll: () => {
    set({ tasks: [] });
  },

  suggestTimeForTask: (taskId, date, commitments) => {
    const task = get().tasks.find(t => t.id === taskId);
    if (!task) return;

    // Get completion history for energy-aware suggestions
    const completionHistory = get().tasks
      .filter(t => t.completed)
      .map(t => ({
        time: t.scheduledFor || t.createdAt,
        durationMinutes: t.estimatedMinutes,
        completed: t.completed
      }));

    const suggestedTime = suggestOptimalTaskTime(
      task,
      date,
      commitments,
      completionHistory
    );

    if (suggestedTime) {
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId ? { ...t, scheduledFor: suggestedTime } : t
        ),
      }));
    }
  },

  getTasksForDate: (date) => {
    return get().tasks.filter(task => {
      if (!task.scheduledFor) return false;
      return isSameDay(task.scheduledFor, date) && !task.completed;
    });
  },

  getOverdueTasks: () => {
    const now = new Date();
    return get().tasks.filter(task => {
      if (!task.scheduledFor || task.completed) return false;
      return task.scheduledFor < now;
    });
  },
}));
