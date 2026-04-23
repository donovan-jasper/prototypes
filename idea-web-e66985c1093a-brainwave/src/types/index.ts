export interface SensorData {
  x: number;
  y: number;
  z: number;
  timestamp?: number;
}

export interface Session {
  id: number;
  profileId: string;
  startTime: number;
  endTime: number;
  drowsinessEvents: number;
}

export interface DrowsinessEvent {
  id: number;
  sessionId: number;
  timestamp: number;
  alertLevel: number;
  profile: string;
}

export type ActivityProfile = {
  id: string;
  name: string;
  icon: string;
  sensitivity: number;
  alertStyle: 'gentle' | 'standard' | 'aggressive';
};

export type AlertConfig = {
  hapticIntensity: 'light' | 'medium' | 'heavy';
  soundVolume: number;
  vibrationPattern: 'short' | 'medium' | 'long';
};
