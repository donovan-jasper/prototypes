import { scheduleAlertNotification } from '../lib/utils/notifications';

describe('notifications', () => {
  it('schedules notification for price drop alert', async () => {
    const result = await scheduleAlertNotification({
      title: 'Price Drop!',
      body: 'Legendary Sword now 20% off',
      trigger: { seconds: 60 }
    });
    expect(result).toBeTruthy();
  });
});
