export interface Expense {
  id: number;
  description: string;
  amount: number;
  category: string;
  paidBy: string;
  splitWith: string[];
  date: string;
  createdAt: number;
  updatedAt: number;
  syncStatus: string;
}

export interface User {
  id: string;
  name: string;
  publicKey: string;
  createdAt: number;
}

export interface SyncLog {
  id: number;
  deviceId: string;
  timestamp: number;
  action: string;
  recordId?: number;
  recordType: string;
  syncStatus: string;
}

export type SyncStatus = 'connected' | 'syncing' | 'offline';
