export interface Habit {
  id: string;
  userId: string;
  name: string;
  frequency: string;
  reminderTime: string;
  createdAt: string;
}

export interface Completion {
  id: number;
  habitId: string;
  date: string;
  completed: boolean;
  note?: string;
  habitName?: string; // Added for join queries
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Group {
  id: string;
  name: string;
  inviteCode: string;
  createdAt: string;
}

export interface SocialFeedItem {
  id: number;
  userId: string;
  habitId: string;
  action: string;
  timestamp: string;
  userName?: string;
  habitName?: string;
}

export interface UserPreferences {
  userId: string;
  coachTone: 'supportive' | 'encouraging' | 'challenging';
  notificationTime: string;
}
