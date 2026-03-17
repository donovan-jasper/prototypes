export interface ScheduleBlock {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  type: 'work' | 'appointment' | 'personal';
  color?: string;
}

export interface Task {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  estimatedMinutes: number;
  completed: boolean;
  scheduledFor?: Date;
  timeConstraints?: {
    businessHours?: boolean;
    preferredTimeWindow?: { start: number; end: number };
  };
  createdAt: Date;
}

export interface Routine {
  id: string;
  name: string;
  tasks: string[];
  flexible: boolean;
  preferredTimeWindow?: { start: number; end: number };
  streak: number;
  lastCompleted?: Date;
  lastSkipReason?: string;
}

export interface TimeSlot {
  start: Date;
  end: Date;
}
