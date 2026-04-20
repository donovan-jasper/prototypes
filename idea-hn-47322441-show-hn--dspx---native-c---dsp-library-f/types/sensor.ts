export interface Sensor {
  id: string;
  name: string;
  type: string;
  connectionType: 'bluetooth' | 'wifi' | 'cloud';
  isConnected: boolean;
  lastUpdated: number;
  ownerEmail?: string;
  sharedWith?: string;
}
