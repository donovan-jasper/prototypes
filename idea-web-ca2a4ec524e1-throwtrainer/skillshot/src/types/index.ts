export interface Session {
  id: number;
  date: string;
  activityType: string;
}

export interface Attempt {
  id: number;
  sessionId: number;
  speed: number;
  angle: number;
  hit: boolean;
  timestamp: string;
}

export interface Challenge {
  id: number;
  name: string;
  description: string;
  reward: string;
}

export interface UserStats {
  totalShots: number;
  highestAccuracy: number;
  bestStreak: number;
}

export interface ThrowData {
  speed: number;
  angle: number;
  hit: boolean;
}
