export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  paidBy: string;
  splitWith: string[];
  splitRatios?: number[];
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  publicKey?: string;
  deviceId?: string;
}

export type SyncStatus = 'offline' | 'connecting' | 'connected' | 'syncing';
