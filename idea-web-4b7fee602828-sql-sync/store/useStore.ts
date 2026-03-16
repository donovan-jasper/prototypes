import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useStore = create(
  persist(
    (set) => ({
      databases: [],
      currentDb: null,
      syncQueue: [],
      user: null,
      isOnline: true,
      addDatabase: (database) => set((state) => ({ databases: [...state.databases, database] })),
      removeDatabase: (id) => set((state) => ({ databases: state.databases.filter(db => db.id !== id) })),
      setCurrentDb: (database) => set({ currentDb: database }),
      queueSync: (operation) => set((state) => ({ syncQueue: [...state.syncQueue, operation] })),
      setUser: (user) => set({ user }),
      setOnlineStatus: (isOnline) => set({ isOnline }),
    }),
    {
      name: 'datapal-storage',
      getStorage: () => AsyncStorage,
    }
  )
);

export { useStore };
