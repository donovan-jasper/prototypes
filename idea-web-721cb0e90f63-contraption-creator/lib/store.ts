import { create } from 'zustand';
import { Part } from './parts';

interface ContraptionState {
  parts: Part[];
  isPlaying: boolean;
  selectedPart: string | null;
  isPremium: boolean;
  addPart: (part: Part) => void;
  removePart: (id: string) => void;
  updatePart: (id: string, updates: Partial<Part>) => void;
  clearCanvas: () => void;
  togglePlay: () => void;
  resetSimulation: () => void;
  setPremium: (isPremium: boolean) => void;
}

export const useStore = create<ContraptionState>((set) => ({
  parts: [],
  isPlaying: false,
  selectedPart: null,
  isPremium: false,

  addPart: (part) =>
    set((state) => ({
      parts: [...state.parts, part],
    })),

  removePart: (id) =>
    set((state) => ({
      parts: state.parts.filter((part) => part.id !== id),
    })),

  updatePart: (id, updates) =>
    set((state) => ({
      parts: state.parts.map((part) =>
        part.id === id ? { ...part, ...updates } : part
      ),
    })),

  clearCanvas: () =>
    set(() => ({
      parts: [],
    })),

  togglePlay: () =>
    set((state) => ({
      isPlaying: !state.isPlaying,
    })),

  resetSimulation: () =>
    set(() => ({
      isPlaying: false,
    })),

  setPremium: (isPremium) =>
    set(() => ({
      isPremium,
    })),
}));
