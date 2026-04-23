export interface App {
  packageName: string;
  label: string;
  icon: string;
  lastUsed?: string;
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
  createdAt: string;
}

export interface Gesture {
  id: string;
  pattern: { x: number; y: number }[];
  action: {
    type: 'mode' | 'app';
    id: string;
  };
}
