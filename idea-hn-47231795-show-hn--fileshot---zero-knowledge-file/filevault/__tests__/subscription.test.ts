import { canShare, getRemainingShares, isPremium } from '../lib/subscription';

describe('Subscription', () => {
  it('enforces free tier limits', () => {
    const user = { shareCount: 10, isPremium: false };
    expect(canShare(user)).toBe(false);
  });

  it('allows unlimited shares for premium', () => {
    const user = { shareCount: 100, isPremium: true };
    expect(canShare(user)).toBe(true);
  });

  it('calculates remaining shares', () => {
    const user = { shareCount: 7, isPremium: false };
    expect(getRemainingShares(user)).toBe(3);
  });
});
