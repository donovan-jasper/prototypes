export interface Friend {
  id: string;
  name: string;
  photoUri?: string;
  birthday?: string;
  interests?: string;
  lastContacted?: string;
  reminderFrequency: number; // days between reminders
  createdAt: string;
}

export interface Interaction {
  id: string;
  friendId: string;
  type: 'call' | 'text' | 'video' | 'in-person' | 'other';
  date: string;
  notes?: string;
  photoUri?: string;
  createdAt: string;
}

export interface Reminder {
  id: string;
  friendId: string;
  dueDate: string;
  dismissed: boolean;
  snoozedUntil?: string;
  createdAt: string;
}

export type HealthStatus = 'healthy' | 'warning' | 'neglected';
