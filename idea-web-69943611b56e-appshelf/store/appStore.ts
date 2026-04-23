import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface App {
  packageName: string;
  label: string;
  icon?: string;
}

interface Mode {
  id: string;
  name: string;
  color: string;
  icon?: string;
  appIds: string[];
}

interface AppState {
  activeMode: Mode | null;
  modes: Mode[];
  apps: App[];
  isPremium: boolean;
  setActiveMode: (mode: Mode) => void;
  addMode: (mode: Mode) => void;
  updateMode: (mode: Mode) => void;
  deleteMode: (modeId: string) => void;
  setApps: (apps: App[]) => void;
  setPremium: (isPremium: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeMode: null,
      modes: [],
      apps: [],
      isPremium: false,

      setActiveMode: (mode) => set({ activeMode: mode }),
      addMode: (mode) => set((state) => ({ modes: [...state.modes, mode] })),
      updateMode: (updatedMode) =>
        set((state) => ({
          modes: state.modes.map((mode) =>
            mode.id === updatedMode.id ? updatedMode : mode
          ),
        })),
      deleteMode: (modeId) =>
        set((state) => ({
          modes: state.modes.filter((mode) => mode.id !== modeId),
          activeMode: state.activeMode?.id === modeId ? null : state.activeMode,
        })),
      setApps: (apps) => set({ apps }),
      setPremium: (isPremium) => set({ isPremium }),
    }),
    {
      name: 'flowdeck-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
