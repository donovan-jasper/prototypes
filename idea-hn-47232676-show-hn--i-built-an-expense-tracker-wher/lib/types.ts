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
}

export interface User {
  id: string;
  name: string;
  deviceId: string;
  publicKey: string;
  isCurrentUser: boolean;
}

export type SyncStatus = 'idle' | 'connecting' | 'connected' | 'offline';
