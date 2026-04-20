export interface Reading {
  id?: number;
  sensorId: string;
  timestamp: number;
  value: number;
  confidence?: number;
}
