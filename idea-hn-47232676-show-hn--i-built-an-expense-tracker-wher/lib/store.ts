import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Expense } from './types';

type SyncStatus = 'offline' | 'connecting' | 'connected' | 'syncing';

interface AppState {
  expenses: Expense[];
  users: string[];
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
    }),
    {
      name: 'pairpurse-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isPremium: state.isPremium,
        pairedDevice: state.pairedDevice,
      }),
    }
  )
);
