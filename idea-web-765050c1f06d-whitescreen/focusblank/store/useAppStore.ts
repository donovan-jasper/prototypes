import { create } from 'zustand';
import { openDatabase, saveFocusMode, getFocusModes, saveWidgetPosition, getWidgetPositions } from '../utils/database';
import { Theme, FocusMode, Widget } from './types';

interface AppState {
  currentTheme: Theme;
  currentMode: FocusMode | null;
  focusModes: FocusMode[];
  widgets: Widget[];
  notificationsEnabled: boolean;
  setTheme: (theme: Theme) => void;
  activateFocusMode: (mode: FocusMode) => void;
  addWidget: (widget: Widget) => void;
  updateWidgetPosition: (id: string, x: number, y: number) => void;
  removeWidget: (id: string) => void;
  toggleNotifications: () => void;
  loadFocusModes: () => Promise<void>;
  saveFocusMode: (mode: FocusMode) => Promise<void>;
  loadWidgets: () => Promise<void>;
}

const useAppStore = create<AppState>((set, get) => ({
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
  
  addWidget: async (widget: Widget) => {
    const db = await openDatabase();
    await db.runAsync(
      'INSERT INTO widgets (id, name, type, x, y) VALUES (?, ?, ?, ?, ?)',
      [widget.id, widget.name, widget.type, widget.x, widget.y]
    );
    set((state) => ({ widgets: [...state.widgets, widget] }));
  },
  
  updateWidgetPosition: async (id: string, x: number, y: number) => {
    const db = await openDatabase();
    await saveWidgetPosition(db, id, x, y);
    set((state) => ({
      widgets: state.widgets.map((w) =>
        w.id === id ? { ...w, x, y } : w
      ),
    }));
  },
  
  removeWidget: async (id: string) => {
    const db = await openDatabase();
    await db.runAsync('DELETE FROM widgets WHERE id = ?', [id]);
    set((state) => ({
      widgets: state.widgets.filter((w) => w.id !== id),
    }));
  },
  
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
  
  loadWidgets: async () => {
    const db = await openDatabase();
    const positions = await getWidgetPositions(db);
    set({ widgets: positions });
  },
}));

export default useAppStore;
