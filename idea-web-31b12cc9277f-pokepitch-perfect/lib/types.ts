export interface Drill {
  id: string;
  name: string;
  description: string;
  type: 'aim' | 'timing' | 'swipe' | 'pattern' | 'reflex';
  difficulty: number; // 0.0 to 1.0
  duration: number; // in seconds
  targetCount?: number;
  pattern?: string[];
  speed?: number;
}

export interface DrillResult {
  id: string;
  drillId: string;
  score: number;
  accuracy: number;
  reactionTime: number;
  consistency: number;
  timestamp: number;
  duration: number;
}

export interface UserStats {
  totalDrillsCompleted: number;
  averageScore: number;
  bestDrill: string;
  streak: number;
  lastDrillDate: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  goal: number;
}
