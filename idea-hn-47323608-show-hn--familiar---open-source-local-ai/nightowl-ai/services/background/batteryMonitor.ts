import * as Battery from 'expo-battery';

export class BatteryMonitor {
  private minBatteryLevel: number = 20; // Default minimum battery level
  private isMonitoring: boolean = false;
  private onLowBattery: (() => void) | null = null;

  async startMonitoring(onLowBattery: () => void): Promise<void> {
    if (this.isMonitoring) {
      return;
    }

    this.onLowBattery = onLowBattery;
    this.isMonitoring = true;

    // Check battery level immediately
    await this.checkBatteryLevel();

    // Set up battery level listener
    Battery.addBatteryLevelListener(({ batteryLevel }) => {
      if (batteryLevel * 100 < this.minBatteryLevel) {
        this.handleLowBattery();
      }
    });

    // Set up battery state listener
    Battery.addBatteryStateListener(({ batteryState }) => {
      if (batteryState === Battery.BatteryState.UNPLUGGED) {
        this.handleUnplugged();
      }
    });
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
    this.onLowBattery = null;
    Battery.removeAllListeners();
  }

  setMinBatteryLevel(level: number): void {
    this.minBatteryLevel = level;
  }

  private async checkBatteryLevel(): Promise<void> {
    const batteryLevel = await Battery.getBatteryLevelAsync();
    if (batteryLevel * 100 < this.minBatteryLevel) {
      this.handleLowBattery();
    }
  }

  private handleLowBattery(): void {
    if (this.onLowBattery) {
      this.onLowBattery();
    }
  }

  private handleUnplugged(): void {
    if (this.onLowBattery) {
      this.onLowBattery();
    }
  }
}
