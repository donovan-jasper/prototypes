export interface App {
  packageName: string;
  label: string;
  icon?: string;
  category?: string;
}

export interface Mode {
  id: string;
  name: string;
  color: string;
  icon?: string;
  appIds: string[];
  triggers?: {
    time?: {
      start: string;
      end: string;
    };
    location?: {
      latitude: number;
      longitude: number;
      radius: number;
    };
  };
  createdAt: number;
}

export interface GesturePattern {
  id: string;
  pattern: { x: number; y: number }[];
  action: string; // modeId or appId
}

export interface Settings {
  isPremium: boolean;
  autoSwitchEnabled: boolean;
  showTimer: boolean;
  darkMode: boolean;
  lastSync: number;
}
