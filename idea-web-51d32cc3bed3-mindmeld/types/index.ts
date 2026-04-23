export interface Reminder {
  id: string;
  title: string;
  date: string; // ISO string
  completed: boolean;
  category?: 'personal' | 'work' | 'health' | 'finance' | 'other';
  location?: string;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
  recurrenceEnd?: string; // ISO string
}

export interface Habit {
  id: string;
  title: string;
  streak: number;
  completed: boolean;
  frequency: 'daily' | 'weekly';
}
