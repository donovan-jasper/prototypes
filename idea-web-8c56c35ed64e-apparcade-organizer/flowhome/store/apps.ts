import create from 'zustand';
import { scanInstalledApps } from '@/lib/apps/scanner';
import { getSmartCollections } from '@/lib/database';

interface App {
  id: string;
  name: string;
  icon: string;
  packageName: string;
}

interface Collection {
  id: string;
  name: string;
  apps: App[];
}

interface AppsState {
  apps: App[];
  collections: Collection[];
  isLoading: boolean;
  loadApps: () => Promise<void>;
  loadCollections: () => Promise<void>;
}

export const useAppsStore = create<AppsState>((set) => ({
  apps: [],
  collections: [],
  isLoading: false,
  loadApps: async () => {
    set({ isLoading: true });
    try {
      const apps = await scanInstalledApps();
      set({ apps, isLoading: false });
    } catch (error) {
      console.error('Error loading apps:', error);
      set({ isLoading: false });
    }
  },
  loadCollections: async () => {
    getSmartCollections((collections) => {
      const parsedCollections = collections.map((col) => ({
        id: col.id.toString(),
        name: col.name,
        apps: JSON.parse(col.app_packages),
      }));
      set({ collections: parsedCollections });
    });
  },
}));
