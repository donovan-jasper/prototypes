import create from 'zustand';
import { getPlatforms, addPlatform, deletePlatform } from '../db';

interface Platform {
  id: number;
  name: string;
  apiKey: string;
  businessAccountId?: string;
  pageId?: string;
  connectedAt: string;
}

interface PlatformStore {
  platforms: Platform[];
  loading: boolean;
  error: string | null;
  fetchPlatforms: () => Promise<void>;
  addPlatform: (platform: Platform) => void;
  deletePlatform: (id: number) => void;
}

export const usePlatformStore = create<PlatformStore>((set) => ({
  platforms: [],
  loading: false,
  error: null,

  fetchPlatforms: async () => {
    try {
      set({ loading: true, error: null });
      const platforms = await getPlatforms();
      set({ platforms, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  addPlatform: (platform) => {
    set((state) => ({
      platforms: [platform, ...state.platforms],
    }));
  },

  deletePlatform: (id) => {
    set((state) => ({
      platforms: state.platforms.filter((platform) => platform.id !== id),
    }));
  },
}));
