export interface Widget {
  id: string;
  type: 'timer' | 'scratchpad' | 'habitTracker';
  position: number;
}

export interface FocusMode {
  id: string;
  name: string;
  color: string;
  allowedApps?: string[];
}

export interface Theme {
  id: string;
  name: string;
  background: string;
  text: string;
  widgetBackground: string;
  drawerBackground: string;
  dark: boolean;
}

export interface AppState {
  currentTheme: Theme;
  currentMode: FocusMode | null;
  widgets: Widget[];
  setTheme: (themeId: string) => void;
  setFocusMode: (modeId: string) => void;
  addWidget: (widgetType: 'timer' | 'scratchpad' | 'habitTracker') => void;
  removeWidget: (widgetId: string) => void;
  loadInitialData: () => Promise<void>;
}
