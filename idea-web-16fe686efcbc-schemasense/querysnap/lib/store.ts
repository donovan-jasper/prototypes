import create from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set) => ({
      databases: [],
      queries: [],
      subscription: {
        isPremium: false,
        usage: { queries: 0, limit: 10 },
      },
      addDatabase: (database) =>
        set((state) => ({ databases: [...state.databases, database] })),
      addQuery: (query) =>
        set((state) => ({ queries: [...state.queries, query] })),
      updateSubscription: (status) =>
        set((state) => ({ subscription: { ...state.subscription, ...status } })),
    }),
    {
      name: 'querysnap-storage',
      getStorage: () => AsyncStorage,
    }
  )
);

export default useStore;
