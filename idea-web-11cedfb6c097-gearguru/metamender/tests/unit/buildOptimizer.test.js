import { optimizeBuild } from '../../app/utils/buildOptimizer';

describe('Build Optimizer', () => {
  it('should generate a valid build for given stats', () => {
    const stats = { attack: 100, defense: 50 };
    const build = optimizeBuild(stats);
    expect(build).toHaveProperty('weapons');
    expect(build).toHaveProperty('armor');
  });
});
