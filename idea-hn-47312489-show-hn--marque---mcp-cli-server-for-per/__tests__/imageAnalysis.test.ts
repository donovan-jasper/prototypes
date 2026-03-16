import { extractColors, analyzeTypography } from '../lib/imageAnalysis';

describe('Image Analysis', () => {
  it('extracts dominant colors from image data', () => {
    const mockImageData = 'base64...';
    const colors = extractColors(mockImageData);
    expect(colors).toHaveLength(5);
    expect(colors[0]).toMatch(/^#[0-9A-F]{6}$/i);
  });

  it('identifies font characteristics', () => {
    const mockAnalysis = { fontFamily: 'Sans-serif', weights: [400, 700] };
    expect(analyzeTypography(mockAnalysis)).toHaveProperty('scale');
  });
});
