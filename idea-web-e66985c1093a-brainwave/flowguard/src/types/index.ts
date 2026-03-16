export interface ActivityProfile {
  id: string;
  name: string;
  icon: string;
  sensitivity: number;
}

export interface Session {
  id: number;
  profileId: string;
  startTime: number;
  endTime: number;
  drowsinessEvents: number;
}

export interface SensorData {
  x: number;
  y: number;
  z: number;
}

export interface AlertConfig {
  hapticEnabled: boolean;
  soundEnabled: boolean;
}

export interface Settings {
  hapticEnabled: boolean;
  soundEnabled: boolean;
}
