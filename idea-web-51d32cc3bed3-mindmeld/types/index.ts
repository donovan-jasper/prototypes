export interface Reminder {
  id: string;
  title: string;
  date: string; // ISO string
  completed: boolean;
  category?: 'personal' | 'work' | 'health' | 'finance' | 'other';
  location?: string;
}

export interface Habit {
  id: string;
  title: string;
  streak: number;
  completed: boolean;
  frequency: 'daily' | 'weekly';
}
