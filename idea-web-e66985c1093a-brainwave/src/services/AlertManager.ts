import { DetectionEngine } from './DetectionEngine';
import { AlertService } from './AlertService';
import { DatabaseService } from './DatabaseService';

export class AlertManager {
  private detectionEngine: DetectionEngine;
  private alertService: AlertService;
  private databaseService: DatabaseService;
  private isSnoozed: boolean = false;
  private snoozeEndTime: number = 0;
  private lastAlertTime: number = 0;
  private alertCooldown: number = 30000; // 30 seconds between alerts

  constructor(
    detectionEngine: DetectionEngine,
    alertService: AlertService,
    databaseService: DatabaseService
  ) {
    this.detectionEngine = detectionEngine;
    this.alertService = alertService;
    this.databaseService = databaseService;
  }

  monitorDrowsiness(): void {
    if (this.isSnoozed && Date.now() < this.snoozeEndTime) {
      return;
    }

    if (this.detectionEngine.isDrowsy()) {
      const currentTime = Date.now();
      if (currentTime - this.lastAlertTime > this.alertCooldown) {
        const alertLevel = this.detectionEngine.getAlertLevel();
        this.triggerAlert(alertLevel);
        this.lastAlertTime = currentTime;

        // Record drowsiness event in database
        this.databaseService.recordDrowsinessEvent({
          timestamp: currentTime,
          alertLevel: alertLevel,
          profile: this.detectionEngine.getCurrentProfile()
        });
      }
    }
  }

  private triggerAlert(level: number): void {
    this.alertService.triggerAlert(level);
  }

  snoozeAlert(durationMs: number = 300000): void {
    this.isSnoozed = true;
    this.snoozeEndTime = Date.now() + durationMs;
    this.detectionEngine.resetAlert();
  }

  resetAlertState(): void {
    this.isSnoozed = false;
    this.snoozeEndTime = 0;
    this.detectionEngine.resetAlert();
  }

  isAlertSnoozed(): boolean {
    return this.isSnoozed && Date.now() < this.snoozeEndTime;
  }

  getSnoozeTimeRemaining(): number {
    if (!this.isSnoozed) return 0;
    return Math.max(0, this.snoozeEndTime - Date.now());
  }
}
