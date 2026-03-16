import { create } from 'zustand';
import { audioService } from '../services/audioService';

interface PlayerState {
  currentContent: {
    id: string;
    title: string;
    image: string;
  } | null;
  isPlaying: boolean;
  loadContent: (contentId: string) => Promise<void>;
  setCurrentContent: (content: any) => void;
  togglePlayback: () => Promise<void>;
  stopPlayback: () => Promise<void>;
  setIsPlaying: (isPlaying: boolean) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentContent: null,
  isPlaying: false,

  loadContent: async (contentId) => {
    await audioService.loadContent(contentId);
    set({ isPlaying: false });
  },

  setCurrentContent: (content) => {
    set({ currentContent: content });
  },

  togglePlayback: async () => {
    if (usePlayerStore.getState().isPlaying) {
      await audioService.pause();
      set({ isPlaying: false });
    } else {
      await audioService.play();
      set({ isPlaying: true });
    }
  },

  stopPlayback: async () => {
    await audioService.stop();
    set({ isPlaying: false });
  },

  setIsPlaying: (isPlaying) => {
    set({ isPlaying });
  },
}));
