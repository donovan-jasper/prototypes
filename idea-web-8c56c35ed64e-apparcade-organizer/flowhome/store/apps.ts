import create from 'zustand';
import { scanInstalledApps } from '@/lib/apps/scanner';
import { getSmartCollections } from '@/lib/database';

interface App {
  id: string;
  name: string;
  icon: string;
}

interface Collection {
  id: string;
  name: string;
  apps: App[];
}

interface AppsState {
  apps: App[];
  collections: Collection[];
  loadApps: () => Promise<void>;
  loadCollections: () => Promise<void>;
}

export const useAppsStore = create<AppsState>((set) => ({
  apps: [],
  collections: [],
  loadApps: async () => {
    const apps = await scanInstalledApps();
    set({ apps });
  },
  loadCollections: async () => {
    getSmartCollections((collections) => {
      set({ collections });
    });
  },
}));
