import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Database {
  id: string;
  name: string;
  schema: any;
  connection?: any;
  rowCount: number;
  lastAccessed: string;
}

interface Query {
  text: string;
  sql: string;
  results: any[];
  timestamp: string;
}

interface Subscription {
  isPremium: boolean;
  usage: {
    queries: number;
    limit: number;
  };
}

interface StoreState {
  databases: Database[];
  queries: Query[];
  subscription: Subscription;
  addDatabase: (database: Database) => void;
  addQuery: (query: Query) => void;
  updateSubscription: (status: Partial<Subscription>) => void;
}

const useStore = create<StoreState>()(
  persist(
    (set) => ({
      databases: [],
      queries: [],
      subscription: {
        isPremium: false,
        usage: { queries: 0, limit: 10 },
      },
      addDatabase: (database) =>
        set((state) => ({ 
          databases: [...state.databases, database] 
        })),
      addQuery: (query) =>
        set((state) => ({ 
          queries: [...state.queries, { ...query, timestamp: new Date().toISOString() }] 
        })),
      updateSubscription: (status) =>
        set((state) => ({ 
          subscription: { ...state.subscription, ...status } 
        })),
    }),
    {
      name: 'querysnap-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        databases: state.databases.map(db => ({
          id: db.id,
          name: db.name,
          schema: db.schema,
          rowCount: db.rowCount,
          lastAccessed: db.lastAccessed,
        })),
        queries: state.queries,
        subscription: state.subscription,
      }),
    }
  )
);

export default useStore;
