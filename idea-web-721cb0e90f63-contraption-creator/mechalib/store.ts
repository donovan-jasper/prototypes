import { create } from 'zustand';
import { initDatabase } from './storage';

interface Part {
  id: string;
  type: string;
  position: { x: number; y: number };
  scale: number;
  rotation: number;
}

interface StoreState {
  parts: Part[];
  isPlaying: boolean;
  selectedPart: string | null;
  isPremium: boolean;
  selectedTutorial: any;
  addPart: (part: Part) => void;
  removePart: (id: string) => void;
  updatePart: (id: string, updates: Partial<Part>) => void;
  clearCanvas: () => void;
  togglePlay: () => void;
  setSelectedPart: (part: string | null) => void;
  setPremium: (isPremium: boolean) => void;
  setSelectedTutorial: (tutorial: any) => void;
}

const useStore = create<StoreState>((set) => ({
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

initDatabase();

export { useStore };
