import { scheduleReminder, cancelReminder } from '../lib/notifications';

describe('Notifications', () => {
  test('schedules reminder with correct trigger', async () => {
    const contactId = '123';
    const triggerDate = new Date('2026-03-20T10:00:00');
    const notificationId = await scheduleReminder(contactId, 'Alice', triggerDate);
    expect(notificationId).toBeDefined();
  });

  test('cancels scheduled reminder', async () => {
    const notificationId = 'test-notification-id';
    await expect(cancelReminder(notificationId)).resolves.not.toThrow();
  });
});
