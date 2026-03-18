import { create } from 'zustand';
import type { Expense, User, SyncStatus } from './types';

interface StoreState {
  expenses: Expense[];
  users: User[];
  syncStatus: SyncStatus;
  premium: boolean;
  addExpense: (expense: Expense) => void;
  updateExpense: (id: number, expense: Expense) => void;
  deleteExpense: (id: number) => void;
  setPairedUser: (user: User) => void;
  setSyncStatus: (status: SyncStatus) => void;
  setPremium: (premium: boolean) => void;
}

export const useStore = create<StoreState>((set) => ({
  expenses: [],
  users: [],
  syncStatus: 'offline',
  premium: false,
  addExpense: (expense) => set((state) => ({ expenses: [...state.expenses, expense] })),
  updateExpense: (id, expense) => set((state) => ({
    expenses: state.expenses.map((e) => (e.id === id ? expense : e)),
  })),
  deleteExpense: (id) => set((state) => ({
    expenses: state.expenses.filter((e) => e.id !== id),
  })),
  setPairedUser: (user) => set((state) => ({ users: [...state.users, user] })),
  setSyncStatus: (status) => set({ syncStatus: status }),
  setPremium: (premium) => set({ premium }),
}));

export const useSyncStatus = () => useStore((state) => state.syncStatus);
