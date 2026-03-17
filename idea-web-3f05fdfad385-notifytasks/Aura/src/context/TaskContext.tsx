import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task } from '../types/TaskTypes';
import { TaskService } from '../services/TaskService';
import { NotificationService } from '../services/NotificationService';
import { WidgetService } from '../services/WidgetService';
import { usePremiumStatus } from '../hooks/usePremiumStatus';

interface TaskContextType {
  tasks: Task[];
  addTask: (content: string, type: 'note' | 'task' | 'reminder', dueDate?: Date) => Promise<void>;
  updateTaskStatus: (id: number, isCompleted: boolean) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  refreshTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const isPremium = usePremiumStatus();

  useEffect(() => {
    TaskService.setPremiumStatus(isPremium);
  }, [isPremium]);

  const refreshTasks = async () => {
    const fetchedTasks = await TaskService.getTasks();
    setTasks(fetchedTasks);
    const glanceableTasks = await TaskService.getActiveGlanceableTasks();
    await NotificationService.updatePersistentNotification(glanceableTasks);
    await WidgetService.updateHomeWidgets(glanceableTasks);
  };

  const addTask = async (content: string, type: 'note' | 'task' | 'reminder', dueDate?: Date) => {
    await TaskService.addTask(content, type, dueDate);
    await refreshTasks();
  };

  const updateTaskStatus = async (id: number, isCompleted: boolean) => {
    await TaskService.updateTaskStatus(id, isCompleted);
    await refreshTasks();
  };

  const deleteTask = async (id: number) => {
    await TaskService.deleteTask(id);
    await refreshTasks();
  };

  useEffect(() => {
    refreshTasks();
  }, []);

  return (
    <TaskContext.Provider value={{ tasks, addTask, updateTaskStatus, deleteTask, refreshTasks }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
