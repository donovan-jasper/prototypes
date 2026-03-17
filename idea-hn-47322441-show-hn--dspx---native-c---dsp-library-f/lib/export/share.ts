import { getSensorReadings } from '@/lib/storage/database';
import { useStore } from '@/store';

export const generateShareLink = async (sensorId: string, duration: '1h' | '6h' | '24h' | '7d' | '30d') => {
  const { user } = useStore.getState();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Calculate time range based on duration
  const now = Date.now();
  let startTime = now;

  switch (duration) {
    case '1h':
      startTime = now - 3600000;
      break;
    case '6h':
      startTime = now - 21600000;
      break;
    case '24h':
      startTime = now - 86400000;
      break;
    case '7d':
      startTime = now - 604800000;
      break;
    case '30d':
      startTime = now - 2592000000;
      break;
  }

  // Get readings for the time range
  const readings = await getSensorReadings(sensorId, 10000); // Max 10,000 points
  const filteredReadings = readings.filter(
    (reading: any) => reading.timestamp >= startTime && reading.timestamp <= now
  );

  // Generate a unique token (in a real app, this would be a server-generated token)
  const token = `${sensorId}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

  // In a real implementation, this would store the token and data on the server
  // For this prototype, we'll just return a mock URL
  return `https://sensorsync.example.com/share/${token}`;
};

export const getSharedData = async (token: string) => {
  // In a real implementation, this would fetch data from the server
  // For this prototype, we'll return mock data
  return {
    sensor: {
      id: 'shared-sensor',
      name: 'Shared Sensor',
      type: 'temperature',
    },
    readings: [
      { timestamp: Date.now() - 3600000, value: 22.5 },
      { timestamp: Date.now() - 1800000, value: 23.1 },
      { timestamp: Date.now() - 900000, value: 22.8 },
      { timestamp: Date.now(), value: 23.4 },
    ],
    expiresAt: Date.now() + 86400000, // 24 hours from now
  };
};
