// types/index.ts
export enum TaskType {
  ORGANIZE_PHOTOS = 'organize_photos',
  PROCESS_DOCUMENTS = 'process_documents',
  TRANSCRIBE_AUDIO = 'transcribe_audio',
}

export interface Task {
  id: string;
  type: TaskType;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress?: number;
  filesProcessed?: number;
  createdAt: number;
  completedAt?: number;
  error?: string;
}

export interface NightShiftSchedule {
  enabled: boolean;
  startHour: number;
  endHour: number;
  requiresCharging: boolean;
  minBatteryLevel: number;
}
