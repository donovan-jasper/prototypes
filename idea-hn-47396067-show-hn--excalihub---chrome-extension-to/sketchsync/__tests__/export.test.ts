import { exportToPNG, exportToSVG } from '../lib/export';

describe('Export functionality', () => {
  it('should export canvas to PNG', async () => {
    const mockCanvas = { elements: [] };
    const result = await exportToPNG(mockCanvas);

    expect(result).toBeDefined();
    expect(result.uri).toContain('.png');
  });
});
