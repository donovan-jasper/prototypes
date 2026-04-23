import { AppState, AppStateStatus } from 'react-native';
import { TaskQueue } from './taskQueue';
import { NotificationManager } from './notifications';
import { TaskStatus } from '../types';

export class BackgroundTaskManager {
  private taskQueue: TaskQueue;
  private notificationManager: NotificationManager;
  private appState: AppStateStatus = AppState.currentState;
  private backgroundTaskInterval: NodeJS.Timeout | null = null;

  constructor(taskQueue: TaskQueue) {
    this.taskQueue = taskQueue;
    this.notificationManager = NotificationManager.getInstance();
    this.setupAppStateListener();
  }

  private setupAppStateListener() {
    AppState.addEventListener('change', (nextAppState) => {
      if (this.appState.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to foreground
        this.stopBackgroundMonitoring();
      } else if (this.appState === 'active' && nextAppState.match(/inactive|background/)) {
        // App is going to background
        this.startBackgroundMonitoring();
      }
      this.appState = nextAppState;
    });
  }

  private startBackgroundMonitoring() {
    // Check for running tasks every 30 seconds when in background
    this.backgroundTaskInterval = setInterval(() => {
      const runningTasks = this.taskQueue.getTasks().filter(
        t => t.status === TaskStatus.RUNNING
      );

      if (runningTasks.length > 0) {
        // Notify user that tasks are still running in background
        this.notificationManager.scheduleBackgroundTaskNotification(runningTasks[0]);
      }
    }, 30000);
  }

  private stopBackgroundMonitoring() {
    if (this.backgroundTaskInterval) {
      clearInterval(this.backgroundTaskInterval);
      this.backgroundTaskInterval = null;
    }
  }

  public cleanup() {
    this.stopBackgroundMonitoring();
    AppState.removeEventListener('change', this.setupAppStateListener);
  }
}
