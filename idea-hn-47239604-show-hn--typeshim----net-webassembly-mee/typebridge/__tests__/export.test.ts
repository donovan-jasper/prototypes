import { exportToPWA, generateManifest } from '../lib/export';

describe('PWA Export', () => {
  const mockProject = {
    id: 'test-123',
    name: 'Test App',
    code: 'console.log("test");',
    wasmBytes: new Uint8Array([0x00, 0x61, 0x73, 0x6d]),
  };

  it('should generate valid PWA manifest', () => {
    const manifest = generateManifest(mockProject);
    expect(manifest.name).toBe('Test App');
    expect(manifest.start_url).toBe('/');
  });

  it('should export project as PWA bundle', async () => {
    const result = await exportToPWA(mockProject);
    expect(result.success).toBe(true);
    expect(result.files).toContain('index.html');
    expect(result.files).toContain('manifest.json');
  });
});
