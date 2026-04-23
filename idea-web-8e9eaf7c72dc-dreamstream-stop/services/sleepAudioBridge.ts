import { sleepDetector } from './sleepDetection';
import { audioController } from './audioControl';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';

const BACKGROUND_TASK_NAME = 'sleep-audio-bridge-task';

class SleepAudioBridge {
  private isActive: boolean = false;
  private sleepDetectionTimeout: NodeJS.Timeout | null = null;
  private lastPauseTime: number | null = null;
  private rewindAmount: number = 2; // minutes
  private backgroundTaskRegistered: boolean = false;

  constructor() {
    this.setupSleepDetectionListener();
    this.registerBackgroundTask();
  }

  private setupSleepDetectionListener() {
    sleepDetector.onSleepStateChange((isSleeping) => {
      if (isSleeping) {
        this.handleSleepDetected();
      } else {
        this.handleWakeDetected();
      }
    });
  }

  private async registerBackgroundTask() {
    try {
      // Define the background task
      await TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
        const state = sleepDetector.getCurrentState();

        if (state.isSleeping && state.confidence >= 70) {
          this.handleSleepDetected();
        }

        // Return the status of the task
        return BackgroundFetch.BackgroundFetchResult.NewData;
      });

      // Register the task
      await BackgroundFetch.registerTaskAsync(BACKGROUND_TASK_NAME, {
        minimumInterval: 15, // 15 minutes
        stopOnTerminate: false,
        startOnBoot: true,
      });

      this.backgroundTaskRegistered = true;
      console.log('Background task registered successfully');
    } catch (error) {
      console.error('Failed to register background task:', error);
    }
  }

  private handleSleepDetected() {
    if (!this.isActive) return;

    // Only pause if we haven't paused recently (prevents multiple pauses)
    if (!this.lastPauseTime || (Date.now() - this.lastPauseTime) > 30000) {
      audioController.pausePlayback();
      this.lastPauseTime = Date.now();
    }
  }

  private handleWakeDetected() {
    if (!this.isActive) return;

    // Resume playback with rewind
    audioController.resumePlayback(this.rewindAmount * 60 * 1000);
  }

  public async startMonitoring() {
    if (this.isActive) return;

    try {
      // Start sleep detection
      await sleepDetector.startDetection();

      // Set active flag
      this.isActive = true;

      // Start periodic check (fallback in case event-based detection fails)
      this.startPeriodicCheck();

      console.log('Sleep-Audio bridge monitoring started');
    } catch (error) {
      console.error('Failed to start sleep-audio bridge:', error);
      throw error;
    }
  }

  public async stopMonitoring() {
    if (!this.isActive) return;

    try {
      // Clear periodic check
      if (this.sleepDetectionTimeout) {
        clearTimeout(this.sleepDetectionTimeout);
        this.sleepDetectionTimeout = null;
      }

      // Stop sleep detection
      await sleepDetector.stopDetection();

      // Reset state
      this.isActive = false;
      this.lastPauseTime = null;

      console.log('Sleep-Audio bridge monitoring stopped');
    } catch (error) {
      console.error('Failed to stop sleep-audio bridge:', error);
      throw error;
    }
  }

  private startPeriodicCheck() {
    // Check every 30 seconds as a fallback
    this.sleepDetectionTimeout = setTimeout(() => {
      const state = sleepDetector.getCurrentState();

      if (state.isSleeping && state.confidence >= 70) {
        this.handleSleepDetected();
      }

      // Schedule next check
      this.startPeriodicCheck();
    }, 30000);
  }

  public setRewindAmount(minutes: number) {
    this.rewindAmount = Math.max(0, Math.min(10, minutes)); // Limit to 0-10 minutes
  }

  public getStatus(): { isActive: boolean; isSleeping: boolean; confidence: number } {
    const state = sleepDetector.getCurrentState();
    return {
      isActive: this.isActive,
      isSleeping: state.isSleeping,
      confidence: state.confidence
    };
  }

  public async checkBackgroundTaskStatus() {
    if (this.backgroundTaskRegistered) {
      const status = await BackgroundFetch.getStatusAsync();
      console.log('Background task status:', status);
      return status;
    }
    return null;
  }
}

export const sleepAudioBridge = new SleepAudioBridge();
