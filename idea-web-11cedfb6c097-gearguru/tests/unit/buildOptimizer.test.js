import { optimizeBuilds } from '../../../app/utils/buildOptimizer';

describe('Build Optimizer', () => {
  it('should generate top 3 optimized builds for given stats', () => {
    const stats = { attack: 100, defense: 50, magic: 30, speed: 20 };
    const builds = optimizeBuilds(stats);

    expect(builds.length).toBe(3);
    builds.forEach(build => {
      expect(build).toHaveProperty('weapons');
      expect(build).toHaveProperty('armor');
      expect(build).toHaveProperty('effectiveness');
      expect(build).toHaveProperty('totalStats');
      expect(build).toHaveProperty('score');
    });

    // Verify builds are sorted by score
    for (let i = 1; i < builds.length; i++) {
      expect(builds[i-1].score).toBeGreaterThanOrEqual(builds[i].score);
    }
  });

  it('should handle different stat distributions', () => {
    const stats1 = { attack: 150, defense: 30, magic: 20, speed: 10 };
    const stats2 = { attack: 50, defense: 100, magic: 50, speed: 20 };

    const builds1 = optimizeBuilds(stats1);
    const builds2 = optimizeBuilds(stats2);

    expect(builds1[0].weapons[0].type).toBe('axe'); // High attack stat
    expect(builds2[0].armor[0].type).toBe('robe'); // High magic/defense stat
  });

  it('should calculate correct effectiveness percentages', () => {
    const stats = { attack: 100, defense: 50, magic: 30, speed: 20 };
    const builds = optimizeBuilds(stats);

    builds.forEach(build => {
      const { effectiveness } = build;
      const totalPercent = effectiveness.attack + effectiveness.defense +
                          effectiveness.magic + effectiveness.speed;

      // Allow small floating point differences
      expect(totalPercent).toBeCloseTo(100, 0);
    });
  });
});
