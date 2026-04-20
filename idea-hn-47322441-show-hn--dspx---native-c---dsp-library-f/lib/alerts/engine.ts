import { Alert } from '@/types/alerts';
import { SensorReading } from '@/types/sensors';

export const evaluateAlert = (alert: Alert, reading: SensorReading): boolean => {
  // Basic threshold alert evaluation
  if (alert.type === 'threshold') {
    const currentValue = reading.value;
    const alertValue = alert.value;

    // Apply hysteresis if configured
    if (alert.hysteresis) {
      if (alert.lastTriggered) {
        const hysteresisValue = alert.condition === 'above'
          ? alertValue - alert.hysteresis
          : alertValue + alert.hysteresis;

        if (alert.condition === 'above' && currentValue <= hysteresisValue) {
          return false;
        }
        if (alert.condition === 'below' && currentValue >= hysteresisValue) {
          return false;
        }
      }
    }

    // Check condition
    if (alert.condition === 'above' && currentValue > alertValue) {
      return true;
    }
    if (alert.condition === 'below' && currentValue < alertValue) {
      return true;
    }
  }

  // Disconnection alert
  if (alert.type === 'disconnection') {
    const now = Date.now();
    const lastReadingTime = reading.timestamp;
    const disconnectThreshold = alert.value || 30000; // Default 30 seconds

    if (now - lastReadingTime > disconnectThreshold) {
      return true;
    }
  }

  // Battery low alert
  if (alert.type === 'battery') {
    const batteryLevel = reading.value;
    const batteryThreshold = alert.value || 20; // Default 20%

    if (batteryLevel < batteryThreshold) {
      return true;
    }
  }

  // Pattern detection (simple rising/falling)
  if (alert.type === 'pattern') {
    if (!reading.previousValue) return false;

    const delta = reading.value - reading.previousValue;
    const threshold = alert.value || 1; // Default 1 unit change

    if (alert.condition === 'rising' && delta > threshold) {
      return true;
    }
    if (alert.condition === 'falling' && delta < -threshold) {
      return true;
    }
  }

  return false;
};

export const getActiveAlerts = async (): Promise<Alert[]> => {
  // In a real app, this would query the database
  // For now, return mock data
  return [
    {
      id: '1',
      sensorId: 'sensor-1',
      type: 'threshold',
      value: 100,
      condition: 'above',
      hysteresis: 5,
      lastTriggered: null,
      isActive: true,
    },
    {
      id: '2',
      sensorId: 'sensor-2',
      type: 'threshold',
      value: 25,
      condition: 'below',
      hysteresis: 2,
      lastTriggered: null,
      isActive: true,
    },
    {
      id: '3',
      sensorId: 'sensor-1',
      type: 'disconnection',
      value: 30000, // 30 seconds
      isActive: true,
    },
    {
      id: '4',
      sensorId: 'battery-sensor',
      type: 'battery',
      value: 20, // 20%
      isActive: true,
    },
    {
      id: '5',
      sensorId: 'temperature-sensor',
      type: 'pattern',
      condition: 'rising',
      value: 1, // 1°C change
      isActive: true,
    },
  ];
};

export const updateAlertLastTriggered = async (alertId: string, timestamp: string) => {
  // In a real app, this would update the database
  console.log(`Updated alert ${alertId} last triggered to ${timestamp}`);
};
