import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Database } from '../types/database';
import { getSchema } from '../lib/storage/cache';

interface DatabaseState {
  databases: Database[];
  addDatabase: (database: Database) => void;
  removeDatabase: (id: string) => void;
  updateSchema: (id: string, schema: any) => void;
  loadSchema: (id: string) => Promise<void>;
}

export const useDatabaseStore = create<DatabaseState>()(
  persist(
    (set, get) => ({
      databases: [],
      addDatabase: (database) => set(state => ({
        databases: [...state.databases, database]
      })),
      removeDatabase: (id) => set(state => ({
        databases: state.databases.filter(db => db.id !== id)
      })),
      updateSchema: (id, schema) => set(state => ({
        databases: state.databases.map(db =>
          db.id === id ? { ...db, schema } : db
        )
      })),
      loadSchema: async (id) => {
        try {
          const schema = await getSchema(id);
          get().updateSchema(id, schema);
        } catch (error) {
          console.error('Failed to load schema:', error);
        }
      }
    }),
    {
      name: 'database-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
