import { NotificationService } from '../../src/services/NotificationService';
import * as Notifications from 'expo-notifications';
import { Task } from '../../src/types/TaskTypes';

jest.mock('expo-notifications');

describe('NotificationService', () => {
  const mockTask: Task = {
    id: 1,
    content: 'Test Task',
    type: 'reminder',
    isCompleted: false,
    dueDate: new Date(Date.now() + 60000),
    isPinned: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    isPremium: false,
  };

  it('schedules a time-based notification', async () => {
    await NotificationService.scheduleReminder(mockTask);

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
      content: {
        title: 'Aura Reminder',
        body: 'Test Task',
        categoryIdentifier: 'AURA_NOTIFICATIONS',
        data: { taskId: 1 },
      },
      trigger: mockTask.dueDate,
    });
  });

  it('updates content of Android persistent notification', async () => {
    const mockTasks = [mockTask];
    await NotificationService.updatePersistentNotification(mockTasks);

    expect(Notifications.setNotificationChannelAsync).toHaveBeenCalled();
    expect(Notifications.presentNotificationAsync).toHaveBeenCalledWith({
      content: {
        title: 'Aura',
        body: 'Test Task',
        categoryIdentifier: 'AURA_NOTIFICATIONS',
        data: { tasks: [1] },
      },
      trigger: null,
    });
  });

  it('processes "complete" action from notification', async () => {
    const mockResponse = {
      actionIdentifier: 'COMPLETE',
      notification: {
        request: {
          content: {
            data: { taskId: 1 },
          },
        },
      },
    };

    await NotificationService.handleNotificationAction(mockResponse as any);

    // Add assertions for complete action handling
  });

  it('processes "snooze" action from notification', async () => {
    const mockResponse = {
      actionIdentifier: 'SNOOZE',
      notification: {
        request: {
          content: {
            data: { taskId: 1 },
          },
        },
      },
    };

    await NotificationService.handleNotificationAction(mockResponse as any);

    // Add assertions for snooze action handling
  });
});
