import React, { createContext, useState, useEffect } from 'react';
import { Task } from '../types/TaskTypes';
import { TaskService } from '../services/TaskService';

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  error: Error | null;
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (id: number, updates: Partial<Task>) => Promise<void>;
  updateTaskStatus: (id: number, isCompleted: boolean) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
}

export const TaskContext = createContext<TaskContextType>({
  tasks: [],
  loading: false,
  error: null,
  addTask: async () => {},
  updateTask: async () => {},
  updateTaskStatus: async () => {},
  deleteTask: async () => {},
});

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const fetchedTasks = await TaskService.getTasks();
      setTasks(fetchedTasks);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch tasks'));
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (task: Omit<Task, 'id'>) => {
    try {
      const newTask = await TaskService.addTask(task);
      setTasks(prev => [...prev, newTask]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add task'));
    }
  };

  const updateTask = async (id: number, updates: Partial<Task>) => {
    try {
      const updatedTask = await TaskService.updateTask(id, updates);
      setTasks(prev => prev.map(task => task.id === id ? updatedTask : task));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update task'));
    }
  };

  const updateTaskStatus = async (id: number, isCompleted: boolean) => {
    try {
      const updatedTask = await TaskService.updateTaskStatus(id, isCompleted);
      setTasks(prev => prev.map(task => task.id === id ? updatedTask : task));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update task status'));
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await TaskService.deleteTask(id);
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete task'));
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <TaskContext.Provider value={{
      tasks,
      loading,
      error,
      addTask,
      updateTask,
      updateTaskStatus,
      deleteTask
    }}>
      {children}
    </TaskContext.Provider>
  );
};
