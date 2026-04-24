import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes } from '../constants/themes';
import { focusModes } from '../constants/focusModes';

interface Widget {
  id: string;
  type: 'timer' | 'scratchpad' | 'habitTracker';
  position: number;
}

interface FocusMode {
  id: string;
  name: string;
  color: string;
  allowedApps?: string[];
}

interface Theme {
  id: string;
  name: string;
  background: string;
  text: string;
  widgetBackground: string;
  drawerBackground: string;
  dark: boolean;
}

interface AppState {
  currentTheme: Theme;
  currentMode: FocusMode | null;
  widgets: Widget[];
  setTheme: (themeId: string) => void;
  setFocusMode: (modeId: string) => void;
  addWidget: (widgetType: 'timer' | 'scratchpad' | 'habitTracker') => void;
  removeWidget: (widgetId: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentTheme: themes[0],
      currentMode: focusModes[0],
      widgets: [
        { id: '1', type: 'timer', position: 0 },
        { id: '2', type: 'scratchpad', position: 1 },
      ],

      setTheme: (themeId) => {
        const theme = themes.find(t => t.id === themeId);
        if (theme) {
          set({ currentTheme: theme });
        }
      },

      setFocusMode: (modeId) => {
        const mode = focusModes.find(m => m.id === modeId);
        if (mode) {
          set({ currentMode: mode });
        }
      },

      addWidget: (widgetType) => {
        set((state) => ({
          widgets: [
            ...state.widgets,
            {
              id: Date.now().toString(),
              type: widgetType,
              position: state.widgets.length,
            },
          ],
        }));
      },

      removeWidget: (widgetId) => {
        set((state) => ({
          widgets: state.widgets.filter(widget => widget.id !== widgetId),
        }));
      },
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
