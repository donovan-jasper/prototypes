export interface Message {
  id: string;
  channelId: string;
  userId: string;
  text: string;
  audioUrl?: string;
  timestamp: number;
  synced: boolean;
  version: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: number | null;
  completed: boolean;
  createdAt: number;
  version?: number;
}

export interface ParsedCommand {
  type: 'task' | 'message' | 'query' | 'status_update';
  content: string; // Main content, e.g., task title, message text, query text, status update text
  details?: string; // Additional descriptive information, especially for tasks
  dueDate?: string; // ISO date string for tasks
  target?: string; // Recipient for messages, or target for queries
}
