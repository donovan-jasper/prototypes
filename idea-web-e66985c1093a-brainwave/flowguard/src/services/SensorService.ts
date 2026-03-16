import { Accelerometer } from 'expo-sensors';
import { SensorData } from '../types';

export class SensorService {
  private isMonitoringActive: boolean = false;
  private dataListeners: ((data: SensorData) => void)[] = [];
  private subscription: any;

  async startMonitoring(): Promise<void> {
    if (this.isMonitoringActive) return;

    this.isMonitoringActive = true;

    // Request permission if needed
    const { status } = await Accelerometer.requestPermissionsAsync();
    if (status !== 'granted') {
      console.error('Accelerometer permission not granted');
      this.isMonitoringActive = false;
      return;
    }

    // Start monitoring
    this.subscription = Accelerometer.addListener(data => {
      this.dataListeners.forEach(listener => listener(data));
    });

    // Set update interval (100ms)
    Accelerometer.setUpdateInterval(100);
  }

  async stopMonitoring(): Promise<void> {
    if (!this.isMonitoringActive) return;

    this.isMonitoringActive = false;

    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
  }

  isMonitoring(): boolean {
    return this.isMonitoringActive;
  }

  onDataReceived(callback: (data: SensorData) => void): void {
    this.dataListeners.push(callback);
  }

  removeDataListener(callback: (data: SensorData) => void): void {
    this.dataListeners = this.dataListeners.filter(listener => listener !== callback);
  }
}
