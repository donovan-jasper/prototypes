import { create } from 'zustand';
import { getAllMedia, deleteMedia as dbDeleteMedia } from '../database/queries';

interface MediaItem {
  id: string;
  localPath: string;
  source: string;
  hash: string;
  cloudId: string;
}

interface MediaStore {
  media: MediaItem[];
  loading: boolean;
  loadMedia: () => Promise<void>;
  addMedia: (items: MediaItem | MediaItem[]) => void;
  removeMedia: (id: string) => void;
  clearMedia: () => void;
}

export const useMediaStore = create<MediaStore>((set) => ({
  media: [],
  loading: false,

  loadMedia: async () => {
    set({ loading: true });
    try {
      const media = await getAllMedia();
      set({ media, loading: false });
    } catch (error) {
      console.error('Error loading media:', error);
      set({ loading: false });
    }
  },

  addMedia: (items) => {
    set((state) => ({
      media: [...state.media, ...(Array.isArray(items) ? items : [items])],
    }));
  },

  removeMedia: (id) => {
    set((state) => ({
      media: state.media.filter((item) => item.id !== id),
    }));
  },

  clearMedia: () => {
    set({ media: [] });
  },
}));
