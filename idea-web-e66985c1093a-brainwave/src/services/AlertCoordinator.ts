import { DetectionEngine } from './DetectionEngine';
import { AlertService } from './AlertService';
import { AppContextType } from '../context/AppContext';
import { ActivityProfile } from '../types';

export class AlertCoordinator {
  private detectionEngine: DetectionEngine;
  private alertService: AlertService;
  private appContext: AppContextType;
  private isSnoozed: boolean = false;
  private snoozeTimeout: NodeJS.Timeout | null = null;

  constructor(
    detectionEngine: DetectionEngine,
    alertService: AlertService,
    appContext: AppContextType
  ) {
    this.detectionEngine = detectionEngine;
    this.alertService = alertService;
    this.appContext = appContext;

    // Set up event listeners
    this.setupListeners();
  }

  private setupListeners(): void {
    // Listen for drowsiness events from DetectionEngine
    this.detectionEngine.on('drowsinessDetected', this.handleDrowsinessEvent.bind(this));

    // Listen for snooze/reset actions from UI
    this.appContext.on('snoozeAlert', this.handleSnooze.bind(this));
    this.appContext.on('resetAlert', this.handleReset.bind(this));
  }

  private async handleDrowsinessEvent(): Promise<void> {
    if (this.isSnoozed) return;

    // Record the drowsiness event in the context
    this.appContext.recordDrowsinessEvent();

    // Trigger appropriate alert
    const alertLevel = this.calculateAlertLevel();
    await this.alertService.triggerAlert(alertLevel);

    // Update UI state
    this.appContext.updateUIState({
      isAlertActive: true,
      alertLevel: alertLevel,
    });
  }

  private calculateAlertLevel(): number {
    // Calculate alert level based on:
    // 1. Current profile sensitivity
    // 2. Number of consecutive drowsiness events
    // 3. Time since last alert

    const profileSensitivity = this.appContext.activeProfile?.sensitivity || 1.0;
    const consecutiveEvents = this.detectionEngine.getConsecutiveDrowsinessEvents();
    const timeSinceLastAlert = this.detectionEngine.getTimeSinceLastAlert();

    // Simple escalation logic
    let level = 1;

    if (consecutiveEvents > 2) {
      level = 2;
    }

    if (timeSinceLastAlert < 30000) { // Less than 30 seconds since last alert
      level = 3;
    }

    // Adjust based on profile sensitivity
    return Math.min(Math.ceil(level * profileSensitivity), 3);
  }

  private handleSnooze(duration: number = 300000): void {
    this.isSnoozed = true;

    // Clear any existing snooze timeout
    if (this.snoozeTimeout) {
      clearTimeout(this.snoozeTimeout);
    }

    // Set new snooze timeout
    this.snoozeTimeout = setTimeout(() => {
      this.isSnoozed = false;
      this.snoozeTimeout = null;
    }, duration);

    // Update UI state
    this.appContext.updateUIState({
      isSnoozed: true,
      snoozeEndTime: Date.now() + duration,
    });
  }

  private handleReset(): void {
    // Reset the detection engine state
    this.detectionEngine.reset();

    // Clear any active alerts
    this.alertService.clearAlerts();

    // Update UI state
    this.appContext.updateUIState({
      isAlertActive: false,
      alertLevel: 0,
      isSnoozed: false,
    });
  }

  public cleanup(): void {
    // Remove event listeners
    this.detectionEngine.off('drowsinessDetected', this.handleDrowsinessEvent.bind(this));
    this.appContext.off('snoozeAlert', this.handleSnooze.bind(this));
    this.appContext.off('resetAlert', this.handleReset.bind(this));

    // Clear any pending timeouts
    if (this.snoozeTimeout) {
      clearTimeout(this.snoozeTimeout);
    }
  }
}
