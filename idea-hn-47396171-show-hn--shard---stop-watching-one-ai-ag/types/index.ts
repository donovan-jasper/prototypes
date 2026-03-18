export enum TaskStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface Task {
  id: string;
  prompt: string;
  status: TaskStatus;
  progress?: number;
  result?: string;
  error?: string;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  templateId?: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  prompt: string;
  icon: string;
  isPro: boolean;
}

export interface UserSubscription {
  isPro: boolean;
  maxParallelTasks: number;
  dailyTaskLimit: number;
  historyRetentionDays: number;
}
