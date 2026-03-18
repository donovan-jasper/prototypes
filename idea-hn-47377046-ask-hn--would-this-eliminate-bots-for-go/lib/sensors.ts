import { Accelerometer, Gyroscope } from 'expo-sensors';

export interface SensorData {
  x: number;
  y: number;
  z: number;
}

let backgroundSubscription: any = null;
let backgroundData: Array<{ data: SensorData; timestamp: number }> = [];
const SAMPLE_INTERVAL = 500;
const RETENTION_PERIOD = 30000; // 30 seconds

export function startBackgroundMonitoring() {
  if (backgroundSubscription) {
    return;
  }

  Accelerometer.setUpdateInterval(SAMPLE_INTERVAL);
  
  backgroundSubscription = Accelerometer.addListener((accelerometerData) => {
    const now = Date.now();
    backgroundData.push({
      data: accelerometerData,
      timestamp: now,
    });

    backgroundData = backgroundData.filter(
      (entry) => now - entry.timestamp <= RETENTION_PERIOD
    );
  });
}

export function stopBackgroundMonitoring() {
  if (backgroundSubscription) {
    backgroundSubscription.remove();
    backgroundSubscription = null;
  }
  backgroundData = [];
}

export function getRecentEntropy(): number {
  if (backgroundData.length < 2) {
    return 0;
  }

  const recentData = backgroundData.map((entry) => entry.data);
  return calculateMovementEntropy(recentData);
}

export function collectBehavioralData(duration = 2000): Promise<SensorData[]> {
  return new Promise((resolve) => {
    const data: SensorData[] = [];
    
    const subscription = Accelerometer.addListener((accelerometerData) => {
      data.push(accelerometerData);
    });
    
    Accelerometer.setUpdateInterval(100);
    
    setTimeout(() => {
      subscription.remove();
      resolve(data);
    }, duration);
  });
}

export function calculateMovementEntropy(data: SensorData[]): number {
  if (data.length < 2) return 0;
  
  let totalVariance = 0;
  
  for (let i = 1; i < data.length; i++) {
    const dx = Math.abs(data[i].x - data[i - 1].x);
    const dy = Math.abs(data[i].y - data[i - 1].y);
    const dz = Math.abs(data[i].z - data[i - 1].z);
    totalVariance += dx + dy + dz;
  }
  
  const avgVariance = totalVariance / (data.length - 1);
  return Math.min(avgVariance * 10, 1);
}
