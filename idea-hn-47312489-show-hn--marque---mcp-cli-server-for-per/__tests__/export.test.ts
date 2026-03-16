import { exportToReactNative, exportToTailwind } from '../lib/export';

describe('Code Export', () => {
  it('generates valid React Native StyleSheet', () => {
    const system = { colors: { primary: '#000' } };
    const code = exportToReactNative(system);
    expect(code).toContain('StyleSheet.create');
    expect(code).toContain('primary: "#000"');
  });

  it('generates valid Tailwind config', () => {
    const system = { colors: { primary: '#000' } };
    const config = exportToTailwind(system);
    expect(config).toContain('module.exports');
    expect(config).toContain('primary: "#000"');
  });
});
