export interface Friend {
  id: number;
  name: string;
  phone: string;
  email?: string;
  lastContact: string | null;
  connectionScore: number;
  createdAt: string;
}

export interface Interaction {
  id: number;
  friendId: number;
  type: 'call' | 'text' | 'hangout' | 'gift';
  date: string;
  notes?: string;
  photoUri?: string;
}

export interface Streak {
  friendId: number;
  currentDays: number;
  longestDays: number;
  lastInteraction: string;
  freezeUsed: boolean;
}

export interface Challenge {
  id: number;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  targetCount: number;
  progress: number;
  completed: boolean;
  createdAt: string;
}
