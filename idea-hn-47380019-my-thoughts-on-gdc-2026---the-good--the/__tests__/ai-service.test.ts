import { generateImage, generateText } from '../lib/ai-service';

describe('AI Service Integration', () => {
  test('generates image with valid prompt', async () => {
    const result = await generateImage('sunset over mountains');
    expect(result).toHaveProperty('imageUrl');
    expect(result).toHaveProperty('attribution');
  }, 30000);

  test('handles API errors gracefully', async () => {
    await expect(generateImage('')).rejects.toThrow();
  });
});
