import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Field {
  name: string;
  type: 'TEXT' | 'INTEGER' | 'REAL' | 'BLOB';
  description?: string;
}

interface Database {
  id: string;
  name: string;
  schema: Field[];
}

interface SyncOperation {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  data?: any;
  rowId?: number;
  timestamp?: number;
}

interface AppState {
  databases: Database[];
  currentDb: Database | null;
  syncQueue: SyncOperation[];
  user: any;
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
        const dbWithId = {
          ...database,
          id: database.id || `db_${Date.now()}`
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
      }),
    }
  )
);

export { useStore };
