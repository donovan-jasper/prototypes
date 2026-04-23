import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { DetectionEngine } from './DetectionEngine';
import { AlertService } from './AlertService';
import { DatabaseService } from './DatabaseService';
import { SensorService } from './SensorService';
import { AlertManager } from './AlertManager';
import { AppState } from 'react-native';

const BACKGROUND_TASK_NAME = 'flowguard-drowsiness-monitor';

export class BackgroundTaskManager {
  private detectionEngine: DetectionEngine;
  private alertService: AlertService;
  public databaseService: DatabaseService;
  private sensorService: SensorService;
  private alertManager: AlertManager;
  private isInitialized: boolean = false;
  private isTaskRegistered: boolean = false;
  private currentAppState: string = 'active';

  constructor() {
    this.detectionEngine = new DetectionEngine('study');
    this.alertService = new AlertService();
    this.databaseService = new DatabaseService();
    this.sensorService = new SensorService();
    this.alertManager = new AlertManager(
      this.detectionEngine,
      this.alertService,
      this.databaseService
    );

    // Track app state changes
    AppState.addEventListener('change', (nextAppState) => {
      this.currentAppState = nextAppState;
      if (nextAppState === 'active') {
        this.handleAppForeground();
      } else if (nextAppState === 'background') {
        this.handleAppBackground();
      }
    });
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    await this.databaseService.initialize();
    await this.alertService.loadSounds();

    this.sensorService.onDataReceived((data) => {
      this.detectionEngine.processSensorData(data);
      this.alertManager.monitorDrowsiness();
    });

    this.isInitialized = true;
  }

  private async handleAppForeground(): Promise<void> {
    if (this.isTaskRegistered) {
      await this.registerBackgroundTask();
    }
  }

  private async handleAppBackground(): Promise<void> {
    if (this.isTaskRegistered) {
      await this.registerBackgroundTask();
    }
  }

  async registerBackgroundTask(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.isTaskRegistered) return;

    // Define the background task
    TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
      try {
        // Start sensor monitoring in background
        await this.sensorService.startMonitoring();

        // Run detection for 15 seconds
        const startTime = Date.now();
        while (Date.now() - startTime < 15000) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          this.alertManager.monitorDrowsiness();
        }

        // Stop sensor monitoring when done
        await this.sensorService.stopMonitoring();

        return BackgroundFetch.BackgroundFetchResult.NewData;
      } catch (error) {
        console.error('Background task error:', error);
        return BackgroundFetch.BackgroundFetchResult.Failed;
      }
    });

    // Register the task with background fetch
    await BackgroundFetch.registerTaskAsync(BACKGROUND_TASK_NAME, {
      minimumInterval: 15, // 15 seconds
      stopOnTerminate: false,
      startOnBoot: true,
    });

    this.isTaskRegistered = true;
  }

  async unregisterBackgroundTask(): Promise<void> {
    if (!this.isTaskRegistered) return;

    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_TASK_NAME);
    this.isTaskRegistered = false;
  }

  async cleanup(): Promise<void> {
    await this.sensorService.stopMonitoring();
    await this.alertService.cleanup();
    await this.databaseService.close();
    await this.unregisterBackgroundTask();
  }

  async startMonitoring(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    await this.sensorService.startMonitoring();
  }

  async stopMonitoring(): Promise<void> {
    await this.sensorService.stopMonitoring();
  }

  getCurrentAppState(): string {
    return this.currentAppState;
  }
}
