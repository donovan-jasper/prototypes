import { blendSystems } from '../lib/blending';

describe('System Blending', () => {
  it('merges two systems with weighted average', () => {
    const system1 = { colors: { primary: '#FF0000' } };
    const system2 = { colors: { primary: '#0000FF' } };
    const blended = blendSystems([system1, system2], [0.5, 0.5]);
    expect(blended.colors.primary).toBe('#7F007F');
  });
});
