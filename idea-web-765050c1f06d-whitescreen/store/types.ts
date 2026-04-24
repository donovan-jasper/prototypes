export interface FocusMode {
  id: string;
  name: string;
  color: string;
  allowedApps: string[];
  widgets: string[];
}

export interface Widget {
  id: string;
  type: 'timer' | 'scratchpad' | 'habitTracker';
  position: number;
  data?: any;
}

export interface Theme {
  id: string;
  name: string;
  background: string;
  text: string;
  drawerBackground: string;
  dark: boolean;
}

export interface AppState {
  currentTheme: Theme;
  currentMode: FocusMode;
  widgets: Widget[];
  setTheme: (themeId: string) => void;
  setFocusMode: (modeId: string) => void;
  getAllowedApps: () => string[];
  addWidget: (widgetType: 'timer' | 'scratchpad' | 'habitTracker') => void;
  removeWidget: (widgetId: string) => void;
  loadInitialData: () => Promise<void>;
}
