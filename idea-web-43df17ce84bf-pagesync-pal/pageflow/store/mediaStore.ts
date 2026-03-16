import create from 'zustand';
import { Media } from '../types';
import { addMedia, updateProgress, getAllMedia, deleteMedia, getActiveMedia } from '../lib/database';
import { syncToCloud, syncFromCloud } from '../lib/sync';

interface MediaStore {
  media: Media[];
  activeMedia: Media[];
  addMedia: (media: Media) => void;
  updateProgress: (id: string, progress: number) => void;
  deleteMedia: (id: string) => void;
  linkFormats: (ids: string[]) => void;
  loadMedia: () => Promise<void>;
  syncMedia: () => Promise<void>;
}

export const useMediaStore = create<MediaStore>((set) => ({
  media: [],
  activeMedia: [],
  addMedia: async (media) => {
    await addMedia(media);
    set((state) => ({
      media: [...state.media, media],
      activeMedia: [...state.activeMedia, media],
    }));
  },
  updateProgress: async (id, progress) => {
    await updateProgress(id, progress);
    set((state) => ({
      media: state.media.map((item) =>
        item.id === id ? { ...item, currentProgress: progress, lastUpdated: new Date() } : item
      ),
      activeMedia: state.activeMedia.map((item) =>
        item.id === id ? { ...item, currentProgress: progress, lastUpdated: new Date() } : item
      ),
    }));
  },
  deleteMedia: async (id) => {
    await deleteMedia(id);
    set((state) => ({
      media: state.media.filter((item) => item.id !== id),
      activeMedia: state.activeMedia.filter((item) => item.id !== id),
    }));
  },
  linkFormats: async (ids) => {
    // In a real app, you would update the database and sync with cloud
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
    const media = await getAllMedia();
    const activeMedia = await getActiveMedia();
    set({ media, activeMedia });
  },
  syncMedia: async () => {
    const success = await syncToCloud();
    if (success) {
      const media = await syncFromCloud();
      set({ media });
    }
  },
}));
