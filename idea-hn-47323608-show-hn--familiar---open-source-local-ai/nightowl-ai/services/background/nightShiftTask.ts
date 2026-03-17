import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as Battery from 'expo-battery';
import { TaskExecutor } from '../ai/taskExecutor';
import { Database } from '../storage/database';
import { NotificationService } from '../notifications/notificationService';
import { NightShiftSchedule } from '@/types';

const NIGHT_SHIFT_TASK_NAME = 'night-shift-task';

export class NightShiftTask {
  private taskExecutor: TaskExecutor;
  private database: Database;
  private notificationService: NotificationService;
  private schedule: NightShiftSchedule;

  constructor(
    taskExecutor: TaskExecutor,
    database: Database,
    notificationService: NotificationService,
    schedule: NightShiftSchedule
  ) {
    this.taskExecutor = taskExecutor;
    this.database = database;
    this.notificationService = notificationService;
    this.schedule = schedule;
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
      // Check if night shift is enabled
      if (!this.schedule.enabled) {
        return BackgroundFetch.BackgroundFetchResult.NoData;
      }

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
          // Update task status to running
          await this.database.updateTaskStatus(task.id, 'running');

          // Execute the task
          const result = await this.taskExecutor.execute(task);

          // Update task status to completed
          await this.database.updateTaskStatus(task.id, 'completed', Date.now());

          completedTasks.push(result);
        } catch (error) {
          console.error(`Error executing task ${task.id}:`, error);

          // Update task status to failed
          await this.database.updateTaskStatus(task.id, 'failed', Date.now());
        }
      }

      // Send notification if tasks were completed
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
    const now = new Date();
    const currentHour = now.getHours();

    // Check if current time is within the night shift window
    if (this.schedule.startHour < this.schedule.endHour) {
      // Window doesn't cross midnight
      return currentHour >= this.schedule.startHour && currentHour < this.schedule.endHour;
    } else {
      // Window crosses midnight
      return currentHour >= this.schedule.startHour || currentHour < this.schedule.endHour;
    }
  }

  private async isBatterySafe(): Promise<boolean> {
    // Check if charging is required and device is charging
    if (this.schedule.requiresCharging) {
      const batteryState = await Battery.getBatteryStateAsync();
      if (batteryState !== Battery.BatteryState.CHARGING) {
        return false;
      }
    }

    // Check battery level
    const batteryLevel = await Battery.getBatteryLevelAsync();
    if (batteryLevel * 100 < this.schedule.minBatteryLevel) {
      return false;
    }

    return true;
  }
}

// Define the background task
TaskManager.defineTask(NIGHT_SHIFT_TASK_NAME, async (taskData) => {
  // This will be called when the background task is triggered
  // In a real implementation, you would create instances of the required services
  // and call the execute method on the NightShiftTask instance

  // For now, we'll just return NoData as a placeholder
  return BackgroundFetch.BackgroundFetchResult.NoData;
});
