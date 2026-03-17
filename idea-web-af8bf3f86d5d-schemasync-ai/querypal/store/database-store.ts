import { create } from 'zustand';
import { getDatabases, addDatabase, removeDatabase } from '../lib/storage/sqlite';
import { fetchAndCacheSchema } from '../lib/storage/cache';

interface Database {
  id: string;
  name: string;
  type: string;
  connectionString: string;
  lastSync: Date;
  schema?: any;
}

interface DatabaseState {
  databases: Database[];
  currentDatabase: Database | null;
  offlineMode: boolean;
  fetchDatabases: () => Promise<void>;
  refreshDatabases: () => Promise<void>;
  addDatabase: (database: Database) => Promise<void>;
  removeDatabase: (id: string) => Promise<void>;
  setCurrentDatabase: (id: string) => void;
  fetchSchema: (id: string) => Promise<void>;
  toggleOfflineMode: () => void;
  clearCache: () => Promise<void>;
}

export const useDatabaseStore = create<DatabaseState>((set, get) => ({
  databases: [],
  currentDatabase: null,
  offlineMode: false,

  fetchDatabases: async () => {
    const databases = await getDatabases();
    set({ databases });
  },

  refreshDatabases: async () => {
    await get().fetchDatabases();
  },

  addDatabase: async (database) => {
    await addDatabase(database);
    await get().fetchDatabases();
  },

  removeDatabase: async (id) => {
    await removeDatabase(id);
    await get().fetchDatabases();
    if (get().currentDatabase?.id === id) {
      set({ currentDatabase: null });
    }
  },

  setCurrentDatabase: (id) => {
    const database = get().databases.find(db => db.id === id);
    set({ currentDatabase: database || null });
  },

  fetchSchema: async (id) => {
    const database = get().databases.find(db => db.id === id);
    if (!database) return;

    try {
      const schema = await fetchAndCacheSchema(database);
      set(state => ({
        databases: state.databases.map(db =>
          db.id === id ? { ...db, schema } : db
        ),
        currentDatabase: state.currentDatabase?.id === id
          ? { ...state.currentDatabase, schema }
          : state.currentDatabase,
      }));
    } catch (error) {
      console.error('Failed to fetch schema:', error);
    }
  },

  toggleOfflineMode: () => {
    set(state => ({ offlineMode: !state.offlineMode }));
  },

  clearCache: async () => {
    await clearCache();
    set(state => ({
      databases: state.databases.map(db => ({ ...db, schema: undefined })),
      currentDatabase: state.currentDatabase
        ? { ...state.currentDatabase, schema: undefined }
        : null,
    }));
  },
}));
