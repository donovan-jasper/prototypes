export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  paidBy: string;
  splitWith: string[];
  date: string;
  createdAt: number;
  updatedAt: number;
  deviceId: string;
}

export interface User {
  id: string;
  name: string;
  deviceId: string;
  publicKey: string;
}

export type SyncStatus = 'offline' | 'connecting' | 'connected' | 'syncing';

export interface VoiceInputResult {
  description: string;
  amount: number;
  category: string;
  splitType: 'even' | 'custom';
  customSplit?: Record<string, number>;
}
