import create from 'zustand';
import { initDatabase } from './storage';

const useStore = create((set) => ({
  parts: [],
  isPlaying: false,
  selectedPart: null,
  isPremium: false,
  selectedTutorial: null,

  addPart: (part) => set((state) => ({ parts: [...state.parts, part] })),
  removePart: (id) =>
    set((state) => ({ parts: state.parts.filter((part) => part.id !== id) })),
  updatePart: (id, updates) =>
    set((state) => ({
      parts: state.parts.map((part) =>
        part.id === id ? { ...part, ...updates } : part
      ),
    })),
  clearCanvas: () => set({ parts: [] }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setSelectedPart: (part) => set({ selectedPart: part }),
  setPremium: (isPremium) => set({ isPremium }),
  setSelectedTutorial: (tutorial) => set({ selectedTutorial: tutorial }),
}));

// Initialize database when store is created
initDatabase();

export { useStore };
