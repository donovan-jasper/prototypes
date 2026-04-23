import create from 'zustand';
import { scanInstalledApps } from '@/lib/apps/scanner';
import { getSmartCollections, updateSmartCollections } from '@/lib/database';

interface App {
  id: string;
  name: string;
  icon: string;
  packageName: string;
}

interface Collection {
  id: string;
  name: string;
  apps: string[];
}

interface AppsState {
  apps: App[];
  collections: Collection[];
  isLoading: boolean;
  error: string | null;
  loadApps: () => Promise<void>;
  loadCollections: () => Promise<void>;
  updateCollections: () => Promise<void>;
}

export const useAppsStore = create<AppsState>((set) => ({
  apps: [],
  collections: [],
  isLoading: false,
  error: null,
  loadApps: async () => {
    set({ isLoading: true, error: null });
    try {
      const apps = await scanInstalledApps();
      if (apps.length === 0) {
        throw new Error('No apps found. Please check your device settings.');
      }
      set({ apps, isLoading: false });
    } catch (error) {
      console.error('Error loading apps:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to scan installed apps',
      });
    }
  },
  loadCollections: async () => {
    set({ isLoading: true, error: null });
    try {
      getSmartCollections((collections) => {
        set({
          collections: collections.map(col => ({
            id: col.id.toString(),
            name: col.name,
            apps: col.app_packages
          })),
          isLoading: false
        });
      });
    } catch (error) {
      console.error('Error loading collections:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load collections',
      });
    }
  },
  updateCollections: async () => {
    set({ isLoading: true, error: null });
    try {
      await updateSmartCollections();
      await useAppsStore.getState().loadCollections();
      set({ isLoading: false });
    } catch (error) {
      console.error('Error updating collections:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update collections',
      });
    }
  },
}));
