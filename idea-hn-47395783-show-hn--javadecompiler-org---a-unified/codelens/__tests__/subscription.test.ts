import { checkUsageLimit, canAccessFeature } from '../lib/subscription/limits';

describe('Subscription Limits', () => {
  it('should enforce free tier limits', () => {
    const usage = { decompilationsThisMonth: 3 };
    const canDecompile = checkUsageLimit(usage, 'free');
    expect(canDecompile).toBe(false);
  });

  it('should allow premium features for subscribers', () => {
    const canCompare = canAccessFeature('comparison', 'premium');
    expect(canCompare).toBe(true);
  });

  it('should deny premium features for free users', () => {
    const canCompare = canAccessFeature('comparison', 'free');
    expect(canCompare).toBe(false);
  });
});
