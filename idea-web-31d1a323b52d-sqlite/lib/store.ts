import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Database {
  name: string;
  fields?: any[];
  rows?: number;
}

interface StoreState {
  databases: Database[];
  currentDatabase: string | null;
  addDatabase: (database: Database) => void;
  removeDatabase: (name: string) => void;
  setCurrentDatabase: (name: string) => void;
  setDatabases: (databases: Database[]) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      databases: [],
      currentDatabase: null,
      addDatabase: (database) => set((state) => ({ databases: [...state.databases, database] })),
      removeDatabase: (name) => set((state) => ({ databases: state.databases.filter(db => db.name !== name) })),
      setCurrentDatabase: (name) => set({ currentDatabase: name }),
      setDatabases: (databases) => set({ databases }),
    }),
    {
      name: 'datapal-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
