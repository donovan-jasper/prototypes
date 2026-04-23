import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as Battery from 'expo-battery';
import * as SecureStore from 'expo-secure-store';
import { TaskExecutor } from '../ai/taskExecutor';
import { Database } from '../storage/database';
import { NotificationService } from '../notifications/notificationService';
import { NightShiftSchedule } from '@/types';

const NIGHT_SHIFT_TASK_NAME = 'night-shift-task';
const NIGHT_SHIFT_SCHEDULE_KEY = 'nightShiftSchedule';

export const registerNightShiftTask = async () => {
  try {
    // Check if task is already registered
    const isRegistered = await TaskManager.isTaskRegisteredAsync(NIGHT_SHIFT_TASK_NAME);
    if (isRegistered) {
      console.log('Night Shift Task: Already registered');
      return;
    }

    // Register the background task
    await BackgroundFetch.registerTaskAsync(NIGHT_SHIFT_TASK_NAME, {
      minimumInterval: 60 * 15, // 15 minutes
      stopOnTerminate: false,
      startOnBoot: true,
    });

    console.log('Night Shift Task: Successfully registered');
  } catch (error) {
    console.error('Night Shift Task: Registration failed', error);
  }
};

TaskManager.defineTask(NIGHT_SHIFT_TASK_NAME, async (taskData) => {
  try {
    console.log('Night Shift Task: Executing background task');

    // Initialize services
    const taskExecutor = new TaskExecutor();
    const database = new Database();
    await database.init();
    const notificationService = new NotificationService();

    // Load schedule from secure storage
    const scheduleJson = await SecureStore.getItemAsync(NIGHT_SHIFT_SCHEDULE_KEY);
    if (!scheduleJson) {
      console.log('Night Shift Task: No schedule found');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const schedule: NightShiftSchedule = JSON.parse(scheduleJson);

    // Check if night shift is enabled
    if (!schedule.enabled) {
      console.log('Night Shift Task: Not enabled in schedule');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // Check if in night shift window
    const now = new Date();
    const currentHour = now.getHours();

    let isInWindow = false;
    if (schedule.startHour < schedule.endHour) {
      // Window doesn't cross midnight
      isInWindow = currentHour >= schedule.startHour && currentHour < schedule.endHour;
    } else {
      // Window crosses midnight
      isInWindow = currentHour >= schedule.startHour || currentHour < schedule.endHour;
    }

    if (!isInWindow) {
      console.log('Night Shift Task: Not in scheduled window');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // Check battery and charging state
    const batteryState = await Battery.getBatteryStateAsync();
    const batteryLevel = await Battery.getBatteryLevelAsync();

    if (schedule.requiresCharging && batteryState !== Battery.BatteryState.CHARGING) {
      console.log('Night Shift Task: Device not charging');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    if (batteryLevel * 100 < schedule.minBatteryLevel) {
      console.log('Night Shift Task: Battery level too low');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // Get pending tasks
    const tasks = await database.getPendingTasks();

    if (tasks.length === 0) {
      console.log('Night Shift Task: No pending tasks');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    console.log(`Night Shift Task: Found ${tasks.length} pending tasks`);

    // Execute tasks
    const completedTasks = [];
    for (const task of tasks) {
      try {
        // Update task status to running
        await database.updateTaskStatus(task.id, 'running');

        // Execute the task
        const result = await taskExecutor.execute(task);

        // Update task status to completed
        await database.updateTaskStatus(task.id, 'completed', Date.now(), result.error);

        completedTasks.push(result);
      } catch (error) {
        console.error(`Night Shift Task: Error executing task ${task.id}`, error);

        // Update task status to failed
        await database.updateTaskStatus(task.id, 'failed', Date.now(), (error as Error).message);
      }
    }

    // Send notification if tasks were completed
    if (completedTasks.length > 0) {
      await notificationService.sendSummaryNotification(completedTasks);
    }

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Night Shift Task: Unhandled error', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const unregisterNightShiftTask = async () => {
  try {
    await TaskManager.unregisterTaskAsync(NIGHT_SHIFT_TASK_NAME);
    console.log('Night Shift Task: Successfully unregistered');
  } catch (error) {
    console.error('Night Shift Task: Unregistration failed', error);
  }
};
