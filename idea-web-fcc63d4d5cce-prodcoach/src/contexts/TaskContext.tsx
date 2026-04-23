import React, { createContext, useContext, useState, useEffect } from 'react';
import { Storage } from '../utils/storage';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  progress: number;
  goal: number;
}

interface TaskContextType {
  tasks: Task[];
  achievements: Achievement[];
  currentStreak: number;
  addTask: (title: string) => void;
  completeTask: (taskId: string) => void;
  getTasks: () => Task[];
  getAchievements: () => Achievement[];
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'first-task',
      name: 'First Steps',
      description: 'Complete your first task',
      unlocked: false,
      progress: 0,
      goal: 1,
    },
    {
      id: 'weekly-streak',
      name: 'Weekly Winner',
      description: 'Maintain a 7-day streak',
      unlocked: false,
      progress: 0,
      goal: 7,
    },
  ]);
  const [currentStreak, setCurrentStreak] = useState(0);

  useEffect(() => {
    loadTasks();
    loadAchievements();
    loadStreak();
  }, []);

  const loadTasks = async () => {
    const savedTasks = await Storage.getItem('tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks).map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
      })));
    }
  };

  const loadAchievements = async () => {
    const savedAchievements = await Storage.getItem('achievements');
    if (savedAchievements) {
      setAchievements(JSON.parse(savedAchievements));
    }
  };

  const loadStreak = async () => {
    const savedStreak = await Storage.getItem('currentStreak');
    if (savedStreak) {
      setCurrentStreak(parseInt(savedStreak, 10));
    }
  };

  const saveTasks = async (newTasks: Task[]) => {
    await Storage.setItem('tasks', JSON.stringify(newTasks));
    setTasks(newTasks);
  };

  const saveAchievements = async (newAchievements: Achievement[]) => {
    await Storage.setItem('achievements', JSON.stringify(newAchievements));
    setAchievements(newAchievements);
  };

  const saveStreak = async (newStreak: number) => {
    await Storage.setItem('currentStreak', newStreak.toString());
    setCurrentStreak(newStreak);
  };

  const addTask = (title: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      completed: false,
      createdAt: new Date(),
    };
    saveTasks([...tasks, newTask]);
  };

  const completeTask = (taskId: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, completed: true, completedAt: new Date() } : task
    );
    saveTasks(updatedTasks);

    // Update achievements
    const updatedAchievements = achievements.map(achievement => {
      if (achievement.id === 'first-task' && !achievement.unlocked) {
        return { ...achievement, unlocked: true, progress: 1 };
      }
      return achievement;
    });
    saveAchievements(updatedAchievements);

    // Update streak
    const today = new Date().toDateString();
    const lastCompleted = updatedTasks
      .filter(t => t.completed)
      .sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0))[0];

    if (lastCompleted && lastCompleted.completedAt?.toDateString() === today) {
      // Already completed today, no streak change
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastCompleted && lastCompleted.completedAt?.toDateString() === yesterday.toDateString()) {
      // Continue streak
      const newStreak = currentStreak + 1;
      saveStreak(newStreak);

      // Check weekly achievement
      if (newStreak >= 7) {
        const updatedAchievements = achievements.map(achievement => {
          if (achievement.id === 'weekly-streak') {
            return { ...achievement, unlocked: true, progress: newStreak };
          }
          return achievement;
        });
        saveAchievements(updatedAchievements);
      }
    } else {
      // Reset streak
      saveStreak(1);
    }
  };

  const getTasks = () => tasks;
  const getAchievements = () => achievements;

  return (
    <TaskContext.Provider value={{
      tasks,
      achievements,
      currentStreak,
      addTask,
      completeTask,
      getTasks,
      getAchievements,
    }}>
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
