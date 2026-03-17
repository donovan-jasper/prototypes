import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useStore = create(
  persist(
    (set, get) => ({
      databases: [],
      currentDb: null,
      syncQueue: [],
      user: null,
      isOnline: true,
      addDatabase: (database) => set((state) => {
        // Ensure the database has a unique ID
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
