export interface Task {
  id: number;
  content: string;
  type: 'note' | 'task' | 'reminder';
  isCompleted: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt?: string;
  dueDate?: string;
  locationData?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
  isPremium?: boolean;
}
