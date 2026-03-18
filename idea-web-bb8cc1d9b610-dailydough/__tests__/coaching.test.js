import { generateCoachingTip } from '../services/coaching';

describe('Coaching Service', () => {
  test('generateCoachingTip returns a valid tip', async () => {
    const tip = await generateCoachingTip();
    expect(tip).toHaveProperty('tip');
    expect(tip).toHaveProperty('category');
    expect(typeof tip.tip).toBe('string');
    expect(typeof tip.category).toBe('string');
  });
});
