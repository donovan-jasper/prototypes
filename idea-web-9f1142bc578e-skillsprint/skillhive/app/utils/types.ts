export interface Skill {
  id: string;
  name: string;
  x: number;
  y: number;
  unlocked: boolean;
}

export interface Connection {
  from: string;
  to: string;
}

export interface Challenge {
  id: number;
  title: string;
  description: string;
  xpReward: number;
  completed: boolean;
}
