export interface Message {
  id: string;
  channelId: string;
  userId: string;
  text: string;
  audioUrl?: string;
  timestamp: number;
  synced?: boolean; // Added for offline sync status
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: number; // Unix timestamp
  completed: boolean;
  createdAt: number;
}

export interface ParsedCommand {
  type: 'message' | 'task' | 'query' | 'status_update' | 'check_in' | 'unknown';
  content: string;
  target?: string; // For queries, who or what is being queried (e.g., "Sarah", "the delivery schedule")
  dueDate?: number; // Unix timestamp for tasks (e.g., for "tomorrow", "next week")
}
