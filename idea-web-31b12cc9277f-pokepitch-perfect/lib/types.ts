export interface Drill {
  id: string;
  name: string;
  description: string;
  type: 'aim' | 'timing' | 'swipe' | 'pattern' | 'reflex';
  difficulty: number; // 0-1 scale
  duration: number; // seconds
  bestScore: number;
  difficultyChange?: number; // Percentage change since last session
}

export interface DrillResult {
  drillId: string;
  score: number;
  accuracy: number;
  reactionTime: number;
  consistency: number;
  timestamp: string;
  difficulty: number;
}

export interface UserStats {
  streak: number;
  totalDrills: number;
  totalScore: number;
  accuracyHistory: number[];
  reactionTimeHistory: number[];
  consistencyHistory: number[];
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface Target {
  id: string;
  x: number;
  y: number;
  timestamp: number;
}

export interface UserInput {
  targetId: string | null;
  timestamp: number;
  isHit: boolean;
  reactionTime?: number;
}
