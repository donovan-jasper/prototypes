export interface Sensor {
  id: string;
  name: string;
  type: string;
  connectionType: 'bluetooth' | 'wifi' | 'cloud';
  isActive: boolean;
  lastConnected: string | null; // ISO timestamp
  batteryLevel?: number;
}

export interface SensorReading {
  id: string;
  sensorId: string;
  timestamp: string; // ISO timestamp
  value: number;
  confidence?: number; // 0-1, 1 = measured, 0 = interpolated
  isGap?: boolean; // True if this is an interpolated gap
}
