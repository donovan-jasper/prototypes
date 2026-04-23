import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { DetectionEngine } from './DetectionEngine';
import { AlertService } from './AlertService';
import { DatabaseService } from './DatabaseService';
import { SensorService } from './SensorService';
import { AlertManager } from './AlertManager';

const BACKGROUND_TASK_NAME = 'flowguard-drowsiness-monitor';

export class BackgroundTaskManager {
  private detectionEngine: DetectionEngine;
  private alertService: AlertService;
  private databaseService: DatabaseService;
  private sensorService: SensorService;
  private alertManager: AlertManager;
  private isInitialized: boolean = false;

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

  async registerBackgroundTask(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

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
  }

  async unregisterBackgroundTask(): Promise<void> {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_TASK_NAME);
  }

  async cleanup(): Promise<void> {
    await this.sensorService.stopMonitoring();
    await this.alertService.cleanup();
    await this.databaseService.close();
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
}
