import create from 'zustand';
import { Media } from '../types';
import { addMedia as dbAddMedia, updateProgress as dbUpdateProgress, getAllMedia, deleteMedia as dbDeleteMedia, getActiveMedia } from '../lib/database';
import { syncToCloud, syncFromCloud } from '../lib/sync';

interface MediaStore {
  media: Media[];
  activeMedia: Media[];
  addMedia: (media: Media) => Promise<void>;
  updateProgress: (id: string, progress: number) => Promise<void>;
  deleteMedia: (id: string) => Promise<void>;
  linkFormats: (ids: string[]) => void;
  loadMedia: () => Promise<void>;
  syncMedia: () => Promise<void>;
}

export const useMediaStore = create<MediaStore>((set) => ({
  media: [],
  activeMedia: [],
  addMedia: async (media) => {
    try {
      await dbAddMedia(media);
      set((state) => ({
        media: [...state.media, media],
        activeMedia: [...state.activeMedia, media],
      }));
    } catch (error) {
      console.error('Store add media error:', error);
    }
  },
  updateProgress: async (id, progress) => {
    try {
      await dbUpdateProgress(id, progress);
      set((state) => ({
        media: state.media.map((item) =>
          item.id === id ? { ...item, currentProgress: progress, lastUpdated: new Date() } : item
        ),
        activeMedia: state.activeMedia.map((item) =>
          item.id === id ? { ...item, currentProgress: progress, lastUpdated: new Date() } : item
        ),
      }));
    } catch (error) {
      console.error('Store update progress error:', error);
    }
  },
  deleteMedia: async (id) => {
    try {
      await dbDeleteMedia(id);
      set((state) => ({
        media: state.media.filter((item) => item.id !== id),
        activeMedia: state.activeMedia.filter((item) => item.id !== id),
      }));
    } catch (error) {
      console.error('Store delete media error:', error);
    }
  },
  linkFormats: async (ids) => {
    set((state) => ({
      media: state.media.map((item) =>
        ids.includes(item.id) ? { ...item, linkedFormats: ids } : item
      ),
      activeMedia: state.activeMedia.map((item) =>
        ids.includes(item.id) ? { ...item, linkedFormats: ids } : item
      ),
    }));
  },
  loadMedia: async () => {
    try {
      const media = await getAllMedia();
      const activeMedia = await getActiveMedia();
      set({ media, activeMedia });
    } catch (error) {
      console.error('Store load media error:', error);
    }
  },
  syncMedia: async () => {
    try {
      const success = await syncToCloud();
      if (success) {
        const media = await syncFromCloud();
        set({ media });
      }
    } catch (error) {
      console.error('Store sync media error:', error);
    }
  },
}));
