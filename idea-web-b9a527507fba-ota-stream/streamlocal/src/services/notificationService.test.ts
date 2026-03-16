import * as Notifications from 'expo-notifications';
import { scheduleAlert, cancelAlert } from './notificationService';

jest.mock('expo-notifications');

describe('notificationService', () => {
  it('schedules notifications for the alert', async () => {
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue('notification-id');

    const alert = {
      program: 'Breaking News',
      time: '18:00',
      weather: true,
      breakingNews: true,
    };

    await scheduleAlert(alert);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(3);
  });

  it('throws an error when notification permission is denied', async () => {
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

    const alert = {
      program: 'Breaking News',
      time: '18:00',
      weather: true,
      breakingNews: true,
    };

    await expect(scheduleAlert(alert)).rejects.toThrow('Permission to send notifications was denied');
  });

  it('cancels the scheduled notification', async () => {
    (Notifications.cancelScheduledNotificationAsync as jest.Mock).mockResolvedValue(undefined);

    await cancelAlert('notification-id');
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('notification-id');
  });
});
