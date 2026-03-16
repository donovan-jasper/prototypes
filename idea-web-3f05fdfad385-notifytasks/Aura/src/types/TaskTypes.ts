export interface Task {
  id: number;
  content: string;
  type: 'note' | 'task' | 'reminder';
  isCompleted: boolean;
  dueDate?: Date;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  locationData?: string;
  isPremium: boolean;
}
