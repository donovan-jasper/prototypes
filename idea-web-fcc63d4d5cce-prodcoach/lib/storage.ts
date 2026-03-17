import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, Achievement } from '../types';

const STORAGE_KEYS = {
  TASKS: '@motimate_tasks',
  STREAK: '@motimate_streak',
  ACHIEVEMENTS: '@motimate_achievements',
  STATS: '@motimate_stats',
};

// Task storage functions
export const saveTasks = async (tasks: Task[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving tasks:', error);
  }
};

export const loadTasks = async (): Promise<Task[]> => {
  try {
    const tasksJson = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
    return tasksJson ? JSON.parse(tasksJson) : [];
  } catch (error) {
    console.error('Error loading tasks:', error);
    return [];
  }
};

// Streak storage functions
export const saveStreak = async (currentStreak: number, longestStreak: number): Promise<void> => {
  try {
    const streakData = { currentStreak, longestStreak };
    await AsyncStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(streakData));
  } catch (error) {
    console.error('Error saving streak:', error);
  }
};

export const loadStreak = async (): Promise<{ currentStreak: number; longestStreak: number }> => {
  try {
    const streakJson = await AsyncStorage.getItem(STORAGE_KEYS.STREAK);
    return streakJson ? JSON.parse(streakJson) : { currentStreak: 0, longestStreak: 0 };
  } catch (error) {
    console.error('Error loading streak:', error);
    return { currentStreak: 0, longestStreak: 0 };
  }
};

// Achievement storage functions
export const saveAchievements = async (achievements: Achievement[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
  } catch (error) {
    console.error('Error saving achievements:', error);
  }
};

export const loadAchievements = async (): Promise<Achievement[]> => {
  try {
    const achievementsJson = await AsyncStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    if (achievementsJson) {
      return JSON.parse(achievementsJson);
    }
    // Return default achievements if none exist
    return [
      { id: 1, title: 'First Steps', description: 'Complete your first task', earned: false },
      { id: 2, title: 'Week Warrior', description: 'Maintain a 7-day streak', earned: false },
      { id: 3, title: 'Habit Master', description: 'Complete 20 tasks', earned: false },
      { id: 4, title: 'Consistency King', description: 'Maintain a 30-day streak', earned: false },
    ];
  } catch (error) {
    console.error('Error loading achievements:', error);
    return [];
  }
};

// Stats storage functions
export const saveStats = async (totalTasks: number, completedTasks: number): Promise<void> => {
  try {
    const stats = { totalTasks, completedTasks };
    await AsyncStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch (error) {
    console.error('Error saving stats:', error);
  }
};

export const loadStats = async (): Promise<{ totalTasks: number; completedTasks: number }> => {
  try {
    const statsJson = await AsyncStorage.getItem(STORAGE_KEYS.STATS);
    return statsJson ? JSON.parse(statsJson) : { totalTasks: 0, completedTasks: 0 };
  } catch (error) {
    console.error('Error loading stats:', error);
    return { totalTasks: 0, completedTasks: 0 };
  }
};

// Clear all storage (useful for testing)
export const clearAllStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
};
