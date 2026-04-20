export interface Alert {
  id: string;
  sensorId: string;
  type: 'threshold' | 'pattern' | 'disconnection' | 'battery';
  value?: number; // For threshold alerts
  condition?: 'above' | 'below'; // For threshold alerts
  hysteresis?: number; // For threshold alerts
  pattern?: string; // For pattern alerts (e.g., 'rising', 'falling')
  lastTriggered?: string; // ISO timestamp
}

export interface AlertHistory {
  id: string;
  alertId: string;
  sensorId: string;
  timestamp: string; // ISO timestamp
  value: number;
  message: string;
}
