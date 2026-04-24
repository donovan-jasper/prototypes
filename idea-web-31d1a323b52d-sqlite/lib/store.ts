import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DatabaseInfo } from './database';

interface AppState {
  databases: DatabaseInfo[];
  currentDatabase: string | null;
  addDatabase: (db: DatabaseInfo) => void;
  removeDatabase: (name: string) => void;
  setCurrentDatabase: (name: string | null) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      databases: [],
      currentDatabase: null,
      addDatabase: (db) => set((state) => ({
        databases: [...state.databases, db]
      })),
      removeDatabase: (name) => set((state) => ({
        databases: state.databases.filter(db => db.name !== name)
      })),
      setCurrentDatabase: (name) => set({ currentDatabase: name }),
    }),
    {
      name: 'datapal-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
