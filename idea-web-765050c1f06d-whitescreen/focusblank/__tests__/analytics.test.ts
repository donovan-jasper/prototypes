import { trackScreenTime, getDailyUsage } from '../utils/analytics';

describe('Screen Time Analytics', () => {
  it('should track daily screen time', async () => {
    await trackScreenTime('2026-03-16', 120); // 2 hours
    const usage = await getDailyUsage('2026-03-16');

    expect(usage).toBe(120);
  });
});
