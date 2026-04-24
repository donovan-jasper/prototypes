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
  isCurrentUser: boolean;
}

export type SyncStatus = 'offline' | 'connecting' | 'connected' | 'syncing';
