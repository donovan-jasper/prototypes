import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Database } from '../types/database';
import { getSchema, clearSchemaCache } from '../lib/storage/cache';
import { useNetworkStore } from './network-store';

interface DatabaseState {
  databases: Database[];
  isLoading: boolean;
  error: string | null;
  addDatabase: (database: Database) => void;
  removeDatabase: (id: string) => void;
  updateSchema: (id: string, schema: any) => void;
  loadSchema: (id: string) => Promise<void>;
  refreshSchema: (id: string) => Promise<void>;
  clearCache: (id: string) => Promise<void>;
}

export const useDatabaseStore = create<DatabaseState>()(
  persist(
    (set, get) => ({
      databases: [],
      isLoading: false,
      error: null,
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
        set({ isLoading: true, error: null });
        try {
          const schema = await getSchema(id);
          get().updateSchema(id, schema);
        } catch (error) {
          console.error('Failed to load schema:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to load schema' });
        } finally {
          set({ isLoading: false });
        }
      },
      refreshSchema: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const schema = await getSchema(id, true);
          get().updateSchema(id, schema);
        } catch (error) {
          console.error('Failed to refresh schema:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to refresh schema' });
        } finally {
          set({ isLoading: false });
        }
      },
      clearCache: async (id) => {
        try {
          await clearSchemaCache(id);
          // Update the database entry to reflect that cache is cleared
          set(state => ({
            databases: state.databases.map(db =>
              db.id === id ? { ...db, schema: { ...db.schema, isCached: false } } : db
            )
          }));
        } catch (error) {
          console.error('Failed to clear cache:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to clear cache' });
        }
      }
    }),
    {
      name: 'database-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Listen for network changes and refresh schemas when online
useNetworkStore.subscribe(
  (state) => state.isOnline,
  (isOnline, previousIsOnline) => {
    if (isOnline && !previousIsOnline) {
      // When we come online, refresh all schemas
      const { databases } = useDatabaseStore.getState();
      databases.forEach(db => {
        useDatabaseStore.getState().refreshSchema(db.id);
      });
    }
  }
);
