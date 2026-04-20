export interface Reading {
  id?: number;
  sensorId: string;
  timestamp: number;
  value: number;
  confidence?: number; // 0-1 where 1 is measured, 0 is fully interpolated
  isInterpolated?: boolean;
  batteryLevel?: number;
  signalStrength?: number;
}
