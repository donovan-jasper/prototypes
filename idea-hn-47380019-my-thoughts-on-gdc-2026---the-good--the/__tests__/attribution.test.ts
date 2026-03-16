import { generateAttribution, validateAttribution } from '../lib/attribution';

describe('Attribution System', () => {
  test('generates valid attribution metadata', () => {
    const attribution = generateAttribution({
      model: 'dall-e-3',
      prompt: 'sunset over mountains',
      timestamp: new Date(),
    });
    
    expect(attribution).toHaveProperty('model');
    expect(attribution).toHaveProperty('prompt');
    expect(attribution).toHaveProperty('timestamp');
    expect(attribution).toHaveProperty('attributionId');
  });

  test('validates attribution completeness', () => {
    const validAttribution = {
      model: 'dall-e-3',
      prompt: 'test',
      timestamp: new Date(),
      attributionId: 'test-123',
    };
    
    expect(validateAttribution(validAttribution)).toBe(true);
    expect(validateAttribution({ model: 'dall-e-3' })).toBe(false);
  });
});
