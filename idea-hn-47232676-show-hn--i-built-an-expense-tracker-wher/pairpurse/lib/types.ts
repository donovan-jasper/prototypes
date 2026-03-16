export interface Expense {
  id: number;
  description: string;
  amount: number;
  category: string;
  paidBy: string;
  splitWith: string[];
  date: string;
}

export interface User {
  id: string;
  name: string;
  publicKey: string;
}

export type SyncStatus = 'connected' | 'syncing' | 'offline';
