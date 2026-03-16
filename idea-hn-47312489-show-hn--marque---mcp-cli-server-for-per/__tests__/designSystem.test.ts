import { generateSystem } from '../lib/designSystem';

describe('Design System Generation', () => {
  it('creates valid design system from analysis', () => {
    const analysis = {
      colors: ['#000000', '#FFFFFF'],
      typography: { base: 16, scale: 1.25 },
      spacing: [4, 8, 16, 32]
    };
    const system = generateSystem(analysis);
    expect(system).toHaveProperty('name');
    expect(system.colors.primary).toBeDefined();
  });
});
