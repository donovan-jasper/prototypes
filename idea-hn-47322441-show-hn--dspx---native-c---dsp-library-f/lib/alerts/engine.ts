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

  // Add more alert types here as needed
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
    },
    {
      id: '2',
      sensorId: 'sensor-2',
      type: 'threshold',
      value: 25,
      condition: 'below',
      hysteresis: 2,
      lastTriggered: null,
    },
  ];
};
