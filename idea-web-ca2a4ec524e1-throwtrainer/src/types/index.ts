export interface Session {
  id: string;
  startTime: Date;
  endTime: Date | null;
  attempts: Attempt[];
  activityType: 'basketball' | 'softball' | 'discgolf' | 'cornhole' | 'darts';
}

export interface Attempt {
  id: string;
  sessionId: string;
  timestamp: Date;
  success: boolean;
  speed: number; // m/s
  angle: number; // degrees
  x: number; // normalized screen position
  y: number;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  targetCount: number;
  timeLimit?: number; // seconds
  activityType: 'basketball' | 'softball' | 'discgolf' | 'cornhole' | 'darts';
  isPremium: boolean;
}

export interface UserStats {
  totalSessions: number;
  totalAttempts: number;
  totalHits: number;
  bestAccuracy: number;
  bestStreak: number;
  bestSpeed: number;
  personalRecords: {
    basketball: number;
    softball: number;
    discgolf: number;
    cornhole: number;
    darts: number;
  };
}

export interface ThrowData {
  x: number;
  y: number;
  speed: number;
  angle: number;
  timestamp: number;
}
