import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { TaskExecutor } from '../ai/taskExecutor';
import { Database } from '../storage/database';
import { NotificationService } from '../notifications/notificationService';

const NIGHT_SHIFT_TASK_NAME = 'night-shift-task';

export class NightShiftTask {
  private taskExecutor: TaskExecutor;
  private database: Database;
  private notificationService: NotificationService;

  constructor(taskExecutor: TaskExecutor, database: Database, notificationService: NotificationService) {
    this.taskExecutor = taskExecutor;
    this.database = database;
    this.notificationService = notificationService;
  }

  async register(): Promise<void> {
    await BackgroundFetch.registerTaskAsync(NIGHT_SHIFT_TASK_NAME, {
      minimumInterval: 60 * 15, // 15 minutes
      stopOnTerminate: false,
      startOnBoot: true,
    });
  }

  async unregister(): Promise<void> {
    await BackgroundFetch.unregisterTaskAsync(NIGHT_SHIFT_TASK_NAME);
  }

  async execute(): Promise<BackgroundFetch.BackgroundFetchResult> {
    try {
      // Check if in night shift window
      if (!this.isInNightShiftWindow()) {
        return BackgroundFetch.BackgroundFetchResult.NoData;
      }

      // Check battery and charging state
      if (!await this.isBatterySafe()) {
        return BackgroundFetch.BackgroundFetchResult.NoData;
      }

      // Get pending tasks
      const tasks = await this.database.getPendingTasks();

      if (tasks.length === 0) {
        return BackgroundFetch.BackgroundFetchResult.NoData;
      }

      // Execute tasks
      const completedTasks = [];
      for (const task of tasks) {
        try {
          const result = await this.taskExecutor.execute(task);
          completedTasks.push(result);
        } catch (error) {
          console.error(`Error executing task ${task.id}:`, error);
        }
      }

      // Send notification
      if (completedTasks.length > 0) {
        await this.notificationService.sendSummaryNotification(completedTasks);
      }

      return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch (error) {
      console.error('Error in night shift task:', error);
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  }

  private isInNightShiftWindow(): boolean {
    // Implement night shift window check
    // This is a simplified version
    return true;
  }

  private async isBatterySafe(): Promise<boolean> {
    // Implement battery safety check
    // This is a simplified version
    return true;
  }
}

// Define the background task
TaskManager.defineTask(NIGHT_SHIFT_TASK_NAME, async (taskData) => {
  // This will be called when the background task is triggered
  // In a real implementation, you would create instances of the required services
  // and call the execute method on the NightShiftTask instance
  return BackgroundFetch.BackgroundFetchResult.NoData;
});
