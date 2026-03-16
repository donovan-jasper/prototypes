import create from 'zustand';
import { syncCloudService } from '../services/cloudSync';
import { registerBackgroundSync } from '../services/backgroundSync';

export const useSyncStore = create((set) => ({
  isSyncing: false,
  progress: 0,
  total: 0,
  syncCloud: async (id) => {
    set({ isSyncing: true });
    const { synced, errors } = await syncCloudService(id);
    set({ isSyncing: false, progress: synced, total: synced + errors });
  },
  registerBackgroundSync: async () => {
    await registerBackgroundSync();
  },
}));
