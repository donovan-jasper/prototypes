export type TensionStatus = 'tense' | 'relaxed';

export type BodyZone = 'jaw' | 'neck' | 'shoulders' | 'hands' | 'forehead';

export interface TensionLog {
  id: number;
  bodyZone: BodyZone;
  status: TensionStatus;
  timestamp: number;
}

export interface Reminder {
  id: number;
  time: string;
  enabled: boolean;
  bodyZone: BodyZone;
}

export interface UserSettings {
  key: string;
  value: string;
}

export interface Exercise {
  id: string;
  name: string;
  duration: number;
  script: string;
  audioFile: string;
  bodyZone: BodyZone;
}
