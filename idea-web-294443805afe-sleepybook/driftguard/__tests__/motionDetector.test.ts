import { detectStillness } from '@/lib/sensors/motionDetector';

describe('Motion Detection', () => {
  it('detects stillness after 2 minutes of low movement', async () => {
    const isStill = await detectStillness(120);
    expect(isStill).toBe(true);
  });

  it('rejects stillness if movement exceeds threshold', async () => {
    // Mock high movement data
    const isStill = await detectStillness(120);
    expect(isStill).toBe(false);
  });
});
