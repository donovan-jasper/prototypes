import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes } from '../constants/themes';
import { focusModes } from '../constants/focusModes';
import {
  initDatabase,
  saveFocusMode,
  getFocusModes,
  saveWidget,
  getWidgets,
  deleteWidget,
  saveTheme,
  getThemes
} from '../utils/database';
import { AppState, Widget, FocusMode, Theme } from './types';

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentTheme: themes[0],
      currentMode: focusModes[0],
      widgets: [],

      setTheme: (themeId: string) => {
        const theme = themes.find(t => t.id === themeId);
        if (theme) {
          set({ currentTheme: theme });
          saveTheme(theme);
        }
      },

      setFocusMode: (modeId: string) => {
        const mode = focusModes.find(m => m.id === modeId);
        if (mode) {
          set({ currentMode: mode });
          saveFocusMode(mode);
        }
      },

      // New method to get current focus mode's allowed apps
      getAllowedApps: () => {
        return get().currentMode?.allowedApps || [];
      },

      addWidget: (widgetType: 'timer' | 'scratchpad' | 'habitTracker') => {
        const newWidget: Widget = {
          id: Date.now().toString(),
          type: widgetType,
          position: get().widgets.length,
        };

        set((state) => ({
          widgets: [...state.widgets, newWidget],
        }));

        saveWidget(newWidget);
      },

      removeWidget: (widgetId: string) => {
        set((state) => ({
          widgets: state.widgets.filter(widget => widget.id !== widgetId),
        }));

        deleteWidget(widgetId);
      },

      loadInitialData: async () => {
        await initDatabase();

        // Load themes
        const savedThemes = await getThemes();
        if (savedThemes.length > 0) {
          set({ currentTheme: savedThemes[0] });
        }

        // Load focus modes
        const savedModes = await getFocusModes();
        if (savedModes.length > 0) {
          set({ currentMode: savedModes[0] });
        }

        // Load widgets
        const savedWidgets = await getWidgets();
        if (savedWidgets.length > 0) {
          set({ widgets: savedWidgets });
        }
      },
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentTheme: state.currentTheme,
        currentMode: state.currentMode,
        widgets: state.widgets,
      }),
    }
  )
);
