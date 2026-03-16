import create from 'zustand';
import { getAllMedia } from '../database/queries';

export const useMediaStore = create((set) => ({
  media: [],
  loadMedia: async () => {
    const media = await getAllMedia();
    set({ media });
  },
}));
