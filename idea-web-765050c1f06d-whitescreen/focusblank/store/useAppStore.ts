import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { defaultThemes } from '../constants/themes';
import { defaultFocusModes } from '../constants/focusModes';

interface Theme {
  id: string;
  name: string;
  background: string;
  text: string;
  dark: boolean;
}

interface FocusMode {
  id: string;
  name: string;
  color: string;
  allowedApps: string[];
}

interface Widget {
  id: string;
  type: 'timer' | 'scratchpad' | 'habit';
  position: number;
}

interface AppState {
  currentTheme: Theme;
  themes: Theme[];
  currentMode: FocusMode | null;
  focusModes: FocusMode[];
  widgets: Widget[];
  setTheme: (themeId: string) => void;
  setFocusMode: (modeId: string) => void;
  addWidget: (widget: Widget) => void;
  removeWidget: (widgetId: string) => void;
  reorderWidgets: (fromIndex: number, toIndex: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentTheme: defaultThemes[0],
      themes: defaultThemes,
      currentMode: null,
      focusModes: defaultFocusModes,
      widgets: [],

      setTheme: (themeId) => {
        const theme = get().themes.find(t => t.id === themeId);
        if (theme) {
          set({ currentTheme: theme });
        }
      },

      setFocusMode: (modeId) => {
        const mode = get().focusModes.find(m => m.id === modeId);
        if (mode) {
          set({ currentMode: mode });
        }
      },

      addWidget: (widget) => {
        set(state => ({
          widgets: [...state.widgets, widget].sort((a, b) => a.position - b.position)
        }));
      },

      removeWidget: (widgetId) => {
        set(state => ({
          widgets: state.widgets.filter(w => w.id !== widgetId)
        }));
      },

      reorderWidgets: (fromIndex, toIndex) => {
        set(state => {
          const newWidgets = [...state.widgets];
          const [removed] = newWidgets.splice(fromIndex, 1);
          newWidgets.splice(toIndex, 0, removed);

          // Update positions
          return {
            widgets: newWidgets.map((widget, index) => ({
              ...widget,
              position: index
            }))
          };
        });
      },
    }),
    {
      name: 'focusblank-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentTheme: state.currentTheme,
        currentMode: state.currentMode,
        widgets: state.widgets,
      }),
    }
  )
);
