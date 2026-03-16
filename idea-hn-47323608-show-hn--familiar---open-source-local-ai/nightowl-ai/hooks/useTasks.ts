import { useState, useEffect } from 'react';
import { Task } from '@/types';
import { TaskQueue } from '@/services/storage/taskQueue';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskQueue] = useState(new TaskQueue());

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const loadedTasks = await taskQueue.getTasks();
      setTasks(loadedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const addTask = async (task: Omit<Task, 'id' | 'createdAt'>) => {
    try {
      const newTask = await taskQueue.addTask(task);
      setTasks([...tasks, newTask]);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const cancelTask = async (taskId: string) => {
    try {
      await taskQueue.cancelTask(taskId);
      setTasks(tasks.map(task =>
        task.id === taskId ? { ...task, status: 'cancelled' } : task
      ));
    } catch (error) {
      console.error('Error cancelling task:', error);
    }
  };

  return {
    tasks,
    addTask,
    cancelTask,
  };
}
