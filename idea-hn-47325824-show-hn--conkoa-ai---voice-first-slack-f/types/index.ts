export interface Message {
  id: string;
  channelId: string;
  userId: string;
  text: string;
  audioUrl?: string;
  timestamp: number;
  synced: boolean;
  version: number; // For conflict resolution, even if not fully implemented in UI yet
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: number;
  completed: boolean;
  createdAt: number;
}

export interface ParsedCommand {
  type: 'message' | 'task' | 'query' | 'status_update';
  action?: string; // e.g., 'create', 'send', 'search'
  content?: string;
  target?: string; // e.g., for queries
  // Add other properties as needed by AI parsing
}
