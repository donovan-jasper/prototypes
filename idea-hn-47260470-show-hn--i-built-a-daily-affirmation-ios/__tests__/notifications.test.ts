import { requestPermissions, cancelAll } from '../lib/notifications';

describe('Notifications', () => {
  test('requestPermissions returns boolean', async () => {
    const result = await requestPermissions();
    expect(typeof result).toBe('boolean');
  });

  test('cancelAll completes without error', async () => {
    await expect(cancelAll()).resolves.not.toThrow();
  });
});
