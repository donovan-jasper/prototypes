import * as Notifications from 'expo-notifications';
import { scheduleMedicationReminder, cancelReminder } from '../../services/notifications';

jest.mock('expo-notifications');

describe('notifications service', () => {
  it('schedules a medication reminder correctly', async () => {
    const medication = { id: 1, name: 'Aspirin', dosage: '1 tablet', schedule: '08:00' };
    Notifications.scheduleNotificationAsync.mockResolvedValue('notification-id');

    const result = await scheduleMedicationReminder(medication);

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
      content: {
        title: 'Time to take Aspirin',
        body: 'Dosage: 1 tablet',
        data: { medicationId: 1 },
      },
      trigger: {
        hour: 8,
        minute: 0,
        repeats: true,
      },
    });
    expect(result).toBe('notification-id');
  });

  it('cancels a reminder correctly', async () => {
    Notifications.cancelScheduledNotificationAsync.mockResolvedValue(true);

    const result = await cancelReminder('notification-id');

    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('notification-id');
    expect(result).toBe(true);
  });
});
