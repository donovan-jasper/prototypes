import { create } from 'zustand';
import { Task } from '../types';

interface TaskState {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  rescheduleTask: (id: string, scheduledFor: Date) => void;
  clearAll: () => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  
  addTask: (task) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      completed: false,
      createdAt: new Date(),
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
}));
