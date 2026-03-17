import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';

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
  updateDatabaseConnection: (id: string, connection: any) => void;
  addQuery: (query: Query) => void;
  updateSubscription: (status: Partial<Subscription>) => void;
  rehydrateConnections: () => Promise<void>;
}

const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
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
      updateDatabaseConnection: (id, connection) =>
        set((state) => ({
          databases: state.databases.map(db =>
            db.id === id ? { ...db, connection } : db
          )
        })),
      addQuery: (query) =>
        set((state) => ({ 
          queries: [...state.queries, { ...query, timestamp: new Date().toISOString() }] 
        })),
      updateSubscription: (status) =>
        set((state) => ({ 
          subscription: { ...state.subscription, ...status } 
        })),
      rehydrateConnections: async () => {
        const { databases } = get();
        
        for (const db of databases) {
          try {
            const dbPath = `${FileSystem.documentDirectory}SQLite/${db.name}.db`;
            const fileInfo = await FileSystem.getInfoAsync(dbPath);
            
            if (fileInfo.exists) {
              const connection = SQLite.openDatabase(db.name);
              set((state) => ({
                databases: state.databases.map(database =>
                  database.id === db.id ? { ...database, connection } : database
                )
              }));
            }
          } catch (error) {
            console.error(`Failed to rehydrate connection for ${db.name}:`, error);
          }
        }
      },
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
