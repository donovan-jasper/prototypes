import create from 'zustand';
import { themes } from '@/lib/themes';
import { getFocusModes, updateFocusMode } from '@/lib/database';

interface Theme {
  id: string;
  name: string;
  isPremium: boolean;
  background: string;
  cardBackground: string;
  iconBackground: string;
  text: string;
}

interface FocusMode {
  id: string;
  name: string;
  isActive: boolean;
}

interface SettingsState {
  theme: Theme;
  themes: Theme[];
  focusModes: FocusMode[];
  setTheme: (themeId: string) => void;
  loadFocusModes: () => Promise<void>;
  toggleFocusMode: (modeId: string) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: themes[0],
  themes,
  focusModes: [],
  setTheme: (themeId) => {
    const theme = themes.find((t) => t.id === themeId);
    if (theme) {
      set({ theme });
    }
  },
  loadFocusModes: async () => {
    getFocusModes((modes) => {
      set({ focusModes: modes.map((mode) => ({ ...mode, isActive: mode.is_active === 1 })) });
    });
  },
  toggleFocusMode: (modeId) => {
    set((state) => ({
      focusModes: state.focusModes.map((mode) =>
        mode.id === modeId ? { ...mode, isActive: !mode.isActive } : mode
      ),
    }));
    updateFocusMode(parseInt(modeId), !state.focusModes.find((mode) => mode.id === modeId)?.isActive);
  },
}));
