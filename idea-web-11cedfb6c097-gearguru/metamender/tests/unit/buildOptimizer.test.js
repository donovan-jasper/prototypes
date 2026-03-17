import { optimizeBuild } from '../../app/utils/buildOptimizer';

describe('Build Optimizer', () => {
  it('should generate a valid build for given stats', () => {
    const stats = { attack: 100, defense: 50 };
    const build = optimizeBuild(stats);
    expect(build).toHaveProperty('weapons');
    expect(build).toHaveProperty('armor');
    expect(build).toHaveProperty('totalStats');
    expect(build).toHaveProperty('effectiveness');
  });

  it('should return 3 weapons and 3 armor pieces', () => {
    const stats = { attack: 300, defense: 250 };
    const build = optimizeBuild(stats);
    expect(build.weapons).toHaveLength(3);
    expect(build.armor).toHaveLength(3);
  });

  it('should return items with actual names', () => {
    const stats = { attack: 300, defense: 250 };
    const build = optimizeBuild(stats);
    
    build.weapons.forEach(weapon => {
      expect(weapon.name).toBeTruthy();
      expect(weapon.name).not.toMatch(/Weapon \d+/);
    });
    
    build.armor.forEach(armor => {
      expect(armor.name).toBeTruthy();
      expect(armor.name).not.toMatch(/Armor \d+/);
    });
  });

  it('should calculate total stats correctly', () => {
    const stats = { attack: 300, defense: 250 };
    const build = optimizeBuild(stats);
    
    const expectedAttack = build.weapons.reduce((sum, w) => sum + w.attack, 0);
    const expectedDefense = build.armor.reduce((sum, a) => sum + a.defense, 0);
    
    expect(build.totalStats.attack).toBe(expectedAttack);
    expect(build.totalStats.defense).toBe(expectedDefense);
  });

  it('should calculate effectiveness percentages', () => {
    const stats = { attack: 300, defense: 250 };
    const build = optimizeBuild(stats);
    
    expect(build.effectiveness.attack).toBeGreaterThanOrEqual(0);
    expect(build.effectiveness.attack).toBeLessThanOrEqual(100);
    expect(build.effectiveness.defense).toBeGreaterThanOrEqual(0);
    expect(build.effectiveness.defense).toBeLessThanOrEqual(100);
    expect(build.effectiveness.overall).toBeGreaterThanOrEqual(0);
    expect(build.effectiveness.overall).toBeLessThanOrEqual(100);
  });

  it('should include game source and special perks', () => {
    const stats = { attack: 300, defense: 250 };
    const build = optimizeBuild(stats);
    
    build.weapons.forEach(weapon => {
      expect(weapon.game).toBeTruthy();
      expect(weapon.special).toBeTruthy();
    });
    
    build.armor.forEach(armor => {
      expect(armor.game).toBeTruthy();
      expect(armor.special).toBeTruthy();
    });
  });
});
