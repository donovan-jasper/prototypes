import { create } from 'zustand';
import { scanInstalledApps } from '../lib/apps/scanner';

interface AppState {
  apps: Array<{
    id: string;
    name: string;
    packageName: string;
    icon?: string;
  }>;
  loading: boolean;
  error: string | null;
  loadApps: () => Promise<void>;
}

export const useAppsStore = create<AppState>((set) => ({
  apps: [],
  loading: false,
  error: null,

  loadApps: async () => {
    set({ loading: true, error: null });
    try {
      const apps = await scanInstalledApps();
      set({ apps, loading: false });
    } catch (error) {
      set({ error: 'Failed to load apps', loading: false });
    }
  },
}));
