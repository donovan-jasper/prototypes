import create from 'zustand';
import { persist } from 'zustand/middleware';
import * as FileSystem from 'expo-file-system';

const useAppStore = create(
  persist(
    (set, get) => ({
      currentDecompilation: null,
      setCurrentDecompilation: (decompilation) => set({ currentDecompilation: decompilation }),

      subscriptionStatus: 'free',
      setSubscriptionStatus: (status) => set({ subscriptionStatus: status }),

      usage: {
        decompilationsThisMonth: 0,
        lastFileSize: 0,
      },
      incrementUsage: (fileSize) =>
        set((state) => ({
          usage: {
            decompilationsThisMonth: state.usage.decompilationsThisMonth + 1,
            lastFileSize: fileSize,
          },
        })),

      isDarkMode: false,
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
    }),
    {
      name: 'codelens-storage',
      getStorage: () => FileSystem,
    }
  )
);

export default useAppStore;
