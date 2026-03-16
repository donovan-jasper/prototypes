import { scheduleNotification, cancelNotification } from '../lib/notifications';

describe('Notification operations', () => {
  it('should schedule a notification', async () => {
    const memory = {
      id: '1',
      title: 'Test Notification',
      description: 'This is a test notification',
      trigger_type: 'time',
      trigger_value: new Date(Date.now() + 60000).toISOString(), // 1 minute from now
      completed: false,
    };
    await scheduleNotification(memory);
    // No assertion, just checking if it runs without errors
  });

  it('should cancel a notification', async () => {
    await cancelNotification('1');
    // No assertion, just checking if it runs without errors
  });
});
