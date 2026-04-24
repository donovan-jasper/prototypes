export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  paidBy: string;
  splitWith: string[];
  splitRatios?: number[];
  date: string;
  createdAt: number;
  updatedAt: number;
}

export interface User {
  id: string;
  name: string;
  publicKey: string;
  isCurrentUser: boolean;
}
