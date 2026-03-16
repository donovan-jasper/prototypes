import create from 'zustand';
import { persist } from 'zustand/middleware';
import { openDatabase, saveFocusMode, getFocusModes } from '../utils/database';
import { Theme, FocusMode, Widget } from './types';

const useAppStore = create(
  persist(
    (set, get) => ({
      currentTheme: {
        background: '#ffffff',
        text: '#000000',
      },
      currentMode: null,
      focusModes: [],
      widgets: [],
      notificationsEnabled: true,

      setTheme: (theme: Theme) => set({ currentTheme: theme }),
      activateFocusMode: (mode: FocusMode) => set({ currentMode: mode }),
      addWidget: (widget: Widget) => set((state) => ({ widgets: [...state.widgets, widget] })),
      toggleNotifications: () => set((state) => ({ notificationsEnabled: !state.notificationsEnabled })),
      loadFocusModes: async () => {
        const db = await openDatabase();
        const modes = await getFocusModes(db);
        set({ focusModes: modes });
      },
      saveFocusMode: async (mode: FocusMode) => {
        const db = await openDatabase();
        await saveFocusMode(db, mode);
        set((state) => ({ focusModes: [...state.focusModes, mode] }));
      },
    }),
    {
      name: 'focusblank-storage',
      getStorage: () => localStorage,
    }
  )
);

export default useAppStore;
