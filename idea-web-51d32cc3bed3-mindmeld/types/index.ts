export interface Reminder {
  id: string;
  title: string;
  date: string;
  completed: boolean;
  category?: string;
  location?: string;
}

export interface Habit {
  id: string;
  title: string;
  streak: number;
  completed: boolean;
  frequency: string;
}

export interface UserPreferences {
  isPremium: boolean;
  notificationsEnabled: boolean;
  theme: 'light' | 'dark';
}
