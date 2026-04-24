import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Expense, User, SyncStatus } from './types';

interface AppState {
  expenses: Expense[];
  users: User[];
  syncStatus: SyncStatus;
  isPremium: boolean;
  pairedDevice: boolean;
  setExpenses: (expenses: Expense[]) => void;
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  setSyncStatus: (status: SyncStatus) => void;
  setPremium: (isPremium: boolean) => void;
  setPairedDevice: (paired: boolean) => void;
  addUser: (user: User) => void;
  setUsers: (users: User[]) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      expenses: [],
      users: [],
      syncStatus: 'offline',
      isPremium: false,
      pairedDevice: false,

      setExpenses: (expenses) => set({ expenses }),
      addExpense: (expense) => set((state) => ({ expenses: [...state.expenses, expense] })),
      updateExpense: (id, expense) =>
        set((state) => ({
          expenses: state.expenses.map((e) => (e.id === id ? { ...e, ...expense } : e)),
        })),
      deleteExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        })),
      setSyncStatus: (status) => set({ syncStatus: status }),
      setPremium: (isPremium) => set({ isPremium }),
      setPairedDevice: (paired) => set({ pairedDevice: paired }),
      addUser: (user) => set((state) => ({ users: [...state.users, user] })),
      setUsers: (users) => set({ users }),
    }),
    {
      name: 'pairpurse-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isPremium: state.isPremium,
        pairedDevice: state.pairedDevice,
        users: state.users,
      }),
    }
  )
);
