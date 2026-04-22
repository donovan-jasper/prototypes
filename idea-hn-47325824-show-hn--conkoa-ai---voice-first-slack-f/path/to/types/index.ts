export interface Message {
  id: string;
  channelId: string;
  userId: string;
  text: string;
  audioUrl?: string;
  timestamp: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: number; // Timestamp
  completed: boolean;
  createdAt: number;
}

export type ParsedCommandType = 'message' | 'task' | 'query' | 'status_update' | 'unknown';

export interface ParsedCommand {
  type: ParsedCommandType;
  content: string; // The main text of the command
  // Additional metadata based on type
  target?: string; // For queries (e.g., "Sarah")
  dueDate?: string; // For tasks (e.g., "tomorrow", "next week")
  priority?: string; // For tasks
  // ... other potential fields
}
