import { logAppUsage, getAppUsage } from '@/lib/database';

describe('usage-tracker', () => {
  it('should log app launch events', async () => {
    logAppUsage('com.example.app', 'Example App', Date.now(), 1000, 'morning', 'home');
    const usage = await new Promise((resolve) => getAppUsage(resolve));
    expect(usage.length).toBeGreaterThan(0);
    expect(usage[0].package_name).toBe('com.example.app');
  });

  it('should aggregate usage statistics', async () => {
    logAppUsage('com.example.app', 'Example App', Date.now(), 1000, 'morning', 'home');
    const usage = await new Promise((resolve) => getAppUsage(resolve));
    expect(usage.length).toBeGreaterThan(0);
    expect(usage[0].duration).toBe(1000);
  });

  it('should prune data to keep last 90 days only', async () => {
    logAppUsage('com.example.app', 'Example App', Date.now() - 91 * 24 * 60 * 60 * 1000, 1000, 'morning', 'home');
    const usage = await new Promise((resolve) => getAppUsage(resolve));
    expect(usage.length).toBe(0);
  });
});
