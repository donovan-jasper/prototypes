import AsyncStorage from '@react-native-async-storage/async-storage';

const TASKS_KEY = 'motimate_tasks';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  streak: number;
  lastCompleted: string | null;
}

export const getTasks = async (): Promise<Task[]> => {
  try {
    const tasksJson = await AsyncStorage.getItem(TASKS_KEY);
    return tasksJson ? JSON.parse(tasksJson) : [];
  } catch (error) {
    console.error('Error loading tasks:', error);
    return [];
  }
};

export const saveTasks = async (tasks: Task[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving tasks:', error);
  }
};
