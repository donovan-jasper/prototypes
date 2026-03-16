import create from 'zustand';
import { connectPlatform, disconnectPlatform, getPlatforms } from '../db';

const usePlatformStore = create((set) => ({
  platforms: [],
  loading: false,
  error: null,
  fetchPlatforms: async () => {
    set({ loading: true, error: null });
    try {
      getPlatforms((platforms) => {
        set({ platforms, loading: false });
      });
    } catch (error) {
      set({ error, loading: false });
    }
  },
  connectPlatform: async (platform) => {
    set({ loading: true, error: null });
    try {
      connectPlatform(platform, (id) => {
        set((state) => ({
          platforms: [...state.platforms, { ...platform, id }],
          loading: false,
        }));
      });
    } catch (error) {
      set({ error, loading: false });
    }
  },
  disconnectPlatform: async (id) => {
    set({ loading: true, error: null });
    try {
      disconnectPlatform(id, () => {
        set((state) => ({
          platforms: state.platforms.filter((p) => p.id !== id),
          loading: false,
        }));
      });
    } catch (error) {
      set({ error, loading: false });
    }
  },
}));

export default usePlatformStore;
