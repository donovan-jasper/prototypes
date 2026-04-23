import React, { createContext, useState, useEffect } from 'react';
import { TaskService } from '../services/TaskService';
import { WidgetService } from '../services/WidgetService';
import { NotificationService } from '../services/NotificationService';

interface Task {
  id: number;
  content: string;
  type: 'task' | 'note' | 'reminder';
  isCompleted: boolean;
  isPinned: boolean;
  createdAt: string;
  dueDate?: string;
}

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  error: Error | null;
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (id: number, updates: Partial<Task>) => Promise<void>;
  updateTaskStatus: (id: number, isCompleted: boolean) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  refreshTasks: () => Promise<void>;
}

export const TaskContext = createContext<TaskContextType>({
  tasks: [],
  loading: false,
  error: null,
  addTask: async () => {},
  updateTask: async () => {},
  updateTaskStatus: async () => {},
  deleteTask: async () => {},
  refreshTasks: async () => {},
});

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const loadedTasks = await TaskService.getTasks();
      setTasks(loadedTasks);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load tasks'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const addTask = async (task: Omit<Task, 'id'>) => {
    try {
      const newTask = await TaskService.addTask(task);
      setTasks(prev => [...prev, newTask]);

      // Update widgets and notifications
      await WidgetService.updateHomeWidgets();
      if (task.type === 'reminder' && task.dueDate) {
        await NotificationService.scheduleReminder(newTask);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add task'));
    }
  };

  const updateTask = async (id: number, updates: Partial<Task>) => {
    try {
      const updatedTask = await TaskService.updateTask(id, updates);
      setTasks(prev => prev.map(task => task.id === id ? updatedTask : task));

      // Update widgets and notifications if relevant changes
      if (updates.isPinned !== undefined || updates.isCompleted !== undefined) {
        await WidgetService.updateHomeWidgets();
      }
      if (updates.dueDate !== undefined && updatedTask.type === 'reminder') {
        await NotificationService.scheduleReminder(updatedTask);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update task'));
    }
  };

  const updateTaskStatus = async (id: number, isCompleted: boolean) => {
    try {
      const updatedTask = await TaskService.updateTaskStatus(id, isCompleted);
      setTasks(prev => prev.map(task => task.id === id ? updatedTask : task));

      // Update widgets and notifications
      await WidgetService.updateHomeWidgets();
      if (updatedTask.type === 'reminder') {
        await NotificationService.cancelNotification(id);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update task status'));
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await TaskService.deleteTask(id);
      setTasks(prev => prev.filter(task => task.id !== id));

      // Update widgets and notifications
      await WidgetService.updateHomeWidgets();
      await NotificationService.cancelNotification(id);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete task'));
    }
  };

  const refreshTasks = async () => {
    await loadTasks();
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        error,
        addTask,
        updateTask,
        updateTaskStatus,
        deleteTask,
        refreshTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};
