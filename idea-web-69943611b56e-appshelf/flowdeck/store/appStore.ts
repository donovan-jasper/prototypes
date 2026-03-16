import create from 'zustand';

interface AppState {
  activeMode: Mode | null;
  modes: Mode[];
  apps: App[];
  isPremium: boolean;
  setActiveMode: (mode: Mode) => void;
  addMode: (mode: Mode) => void;
  removeMode: (id: string) => void;
  setApps: (apps: App[]) => void;
  setIsPremium: (isPremium: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  activeMode: null,
  modes: [],
  apps: [],
  isPremium: false,
  setActiveMode: (mode) => set({ activeMode: mode }),
  addMode: (mode) => set((state) => ({ modes: [...state.modes, mode] })),
  removeMode: (id) => set((state) => ({ modes: state.modes.filter(mode => mode.id !== id) })),
  setApps: (apps) => set({ apps }),
  setIsPremium: (isPremium) => set({ isPremium }),
}));
