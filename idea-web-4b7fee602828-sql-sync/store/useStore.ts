import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Database, Field, SyncOperation } from '../lib/schema'; // Import types

interface AppState {
  databases: Database[];
  currentDb: Database | null;
  syncQueue: SyncOperation[];
  user: any; // Define a proper User type if available
  isOnline: boolean;
  addDatabase: (database: Database) => void;
  removeDatabase: (id: string) => void;
  setCurrentDb: (database: Database | null) => void;
  queueSync: (operation: SyncOperation) => void;
  clearSyncQueue: () => void;
  setUser: (user: any) => void;
  setOnlineStatus: (isOnline: boolean) => void;
  getDatabaseById: (id: string) => Database | undefined;
}

const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      databases: [],
      currentDb: null,
      syncQueue: [],
      user: null,
      isOnline: true,
      addDatabase: (database) => set((state) => {
        // The database object now comes with a unique ID from createDatabase
        // This logic ensures the ID is present, but createDatabase will provide it.
        const dbWithId = {
          ...database,
          id: database.id || `db_${Date.now()}` // Fallback, but createDatabase will provide it
        };
        return { databases: [...state.databases, dbWithId] };
      }),
      removeDatabase: (id) => set((state) => ({
        databases: state.databases.filter(db => db.id !== id),
        currentDb: state.currentDb?.id === id ? null : state.currentDb
      })),
      setCurrentDb: (database) => set({ currentDb: database }),
      queueSync: (operation) => set((state) => ({
        syncQueue: [...state.syncQueue, {
          ...operation,
          timestamp: Date.now()
        }]
      })),
      clearSyncQueue: () => set({ syncQueue: [] }),
      setUser: (user) => set({ user }),
      setOnlineStatus: (isOnline) => set({ isOnline }),
      // Helper function to get database by ID
      getDatabaseById: (id) => {
        const state = get();
        return state.databases.find(db => db.id === id);
      }
    }),
    {
      name: 'datapal-storage',
      getStorage: () => AsyncStorage,
      partialize: (state) => ({
        databases: state.databases,
        user: state.user,
        // Don't persist syncQueue or currentDb
      }),
    }
  )
);

export { useStore };
