import { PARTS, isPremiumPart } from '../lib/parts';

describe('Parts Library', () => {
  it('defines all basic parts', () => {
    expect(PARTS.RAMP).toBeDefined();
    expect(PARTS.BALL).toBeDefined();
    expect(PARTS.WHEEL).toBeDefined();
  });

  it('identifies premium parts', () => {
    expect(isPremiumPart('MOTOR')).toBe(true);
    expect(isPremiumPart('RAMP')).toBe(false);
  });

  it('has correct physics properties for ball', () => {
    expect(PARTS.BALL.restitution).toBeGreaterThan(0.5); // Bouncy
    expect(PARTS.BALL.friction).toBeLessThan(0.1); // Low friction
  });
});
