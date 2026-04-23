import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as Battery from 'expo-battery';
import * as SecureStore from 'expo-secure-store';
import { TaskExecutor } from '../ai/taskExecutor';
import { Database } from '../storage/database';
import { NotificationService } from '../notifications/notificationService';
import { NightShiftSchedule } from '@/types';

const NIGHT_SHIFT_TASK_NAME = 'night-shift-task';
const NIGHT_SHIFT_SCHEDULE_KEY = 'nightShiftSchedule'; // Key for storing the schedule in SecureStore

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
    console.log(`Night Shift Task: Registered task ${NIGHT_SHIFT_TASK_NAME}`);
  }

  async unregister(): Promise<void> {
    await BackgroundFetch.unregisterTaskAsync(NIGHT_SHIFT_TASK_NAME);
    console.log(`Night Shift Task: Unregistered task ${NIGHT_SHIFT_TASK_NAME}`);
  }

  async execute(): Promise<BackgroundFetch.BackgroundFetchResult> {
    try {
      console.log('Night Shift Task: Executing...');

      // Check if night shift is enabled
      if (!this.schedule.enabled) {
        console.log('Night Shift: Not enabled in schedule.');
        return BackgroundFetch.BackgroundFetchResult.NoData;
      }

      // Check if in night shift window
      if (!this.isInNightShiftWindow()) {
        console.log('Night Shift: Not currently in the scheduled window.');
        return BackgroundFetch.BackgroundFetchResult.NoData;
      }

      // Check battery and charging state
      if (!await this.isBatterySafe()) {
        console.log('Night Shift: Battery conditions not met (not charging or low level).');
        return BackgroundFetch.BackgroundFetchResult.NoData;
      }

      // Get pending tasks
      const tasks = await this.database.getPendingTasks();

      if (tasks.length === 0) {
        console.log('Night Shift: No pending tasks found.');
        return BackgroundFetch.BackgroundFetchResult.NoData;
      }

      console.log(`Night Shift: Found ${tasks.length} pending tasks. Starting execution...`);
      const completedTasks = [];
      for (const task of tasks) {
        try {
          // Update task status to running
          await this.database.updateTaskStatus(task.id, 'running');
          console.log(`Night Shift: Task ${task.id} set to running.`);

          // Execute the task
          const result = await this.taskExecutor.execute(task);

          // Update task status to completed
          await this.database.updateTaskStatus(task.id, 'completed', Date.now(), result.error);

          completedTasks.push(result);
          console.log(`Night Shift: Task ${task.id} completed with status: ${result.status}.`);
        } catch (error) {
          console.error(`Error executing task ${task.id}:`, error);

          // Update task status to failed
          await this.database.updateTaskStatus(task.id, 'failed', Date.now(), (error as Error).message);
        }
      }

      // Send notification if tasks were completed
      if (completedTasks.length > 0) {
        await this.notificationService.sendSummaryNotification(completedTasks);
        console.log(`Night Shift: Sent summary notification for ${completedTasks.length} tasks.`);
      }

      return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch (error) {
      console.error('Night Shift Task: Unhandled error during execution:', error);
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  }

  private isInNightShiftWindow(): boolean {
    const now = new Date();
    const currentHour = now.getHours();

    // Check if current time is within the night shift window
    if (this.schedule.startHour < this.schedule.endHour) {
      // Window doesn't cross midnight (e.g., 2am-6am)
      return currentHour >= this.schedule.startHour && currentHour < this.schedule.endHour;
    } else {
      // Window crosses midnight (e.g., 10pm-6am)
      return currentHour >= this.schedule.startHour || currentHour < this.schedule.endHour;
    }
  }

  private async isBatterySafe(): Promise<boolean> {
    // Check if charging is required and device is charging
    if (this.schedule.requiresCharging) {
      const batteryState = await Battery.getBatteryStateAsync();
      if (batteryState !== Battery.BatteryState.CHARGING) {
        console.log('Night Shift: Req');
        return false;
      }
    }

    // Check if battery level is above the minimum threshold
    const batteryLevel = await Battery.getBatteryLevelAsync();
    if (batteryLevel < this.schedule.minBatteryLevel) {
      console.log('Night Shift: Battery level too low.');
      return false;
    }

    return true;
  }
}
