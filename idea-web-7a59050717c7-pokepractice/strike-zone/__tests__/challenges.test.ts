import { generateTargets, validateHit } from '../lib/challenges';

describe('Challenge Logic', () => {
  test('generates random targets within bounds', () => {
    const targets = generateTargets(5, { width: 100, height: 100 });
    expect(targets).toHaveLength(5);
    targets.forEach(t => {
      expect(t.x).toBeGreaterThanOrEqual(0);
      expect(t.x).toBeLessThanOrEqual(100);
    });
  });

  test('validates hit detection', () => {
    const target = { x: 50, y: 50, radius: 10 };
    expect(validateHit({ x: 52, y: 52 }, target)).toBe(true);
    expect(validateHit({ x: 70, y: 70 }, target)).toBe(false);
  });
});
