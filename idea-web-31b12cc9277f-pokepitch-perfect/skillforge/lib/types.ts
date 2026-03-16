export interface Drill {
  id: string;
  name: string;
  description: string;
  type: string;
  difficulty: string;
  duration: number;
  bestScore: number;
}

export interface Score {
  total: number;
  accuracy: number;
  reactionTime: number;
  consistency: number;
}

export interface DrillResult {
  drillId: string;
  score: Score;
  accuracy: number;
  reactionTime: number;
  consistency: number;
  timestamp: string;
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
