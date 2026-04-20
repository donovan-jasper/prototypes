export interface Sensor {
  id: string;
  name: string;
  type: string;
  connectionType: 'bluetooth' | 'wifi' | 'cloud';
  isConnected: boolean;
  lastUpdated: number;
  sampleRate?: number;
  unit?: string;
  minValue?: number;
  maxValue?: number;
  batteryLevel?: number;
  firmwareVersion?: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
}
