import { initDatabase, saveGeneration, getGenerations } from '../lib/database';

describe('Database Operations', () => {
  beforeAll(async () => {
    await initDatabase();
  });

  test('saves and retrieves generations', async () => {
    const generation = {
      prompt: 'test prompt',
      imageUri: 'file://test.jpg',
      attribution: { model: 'dall-e-3', timestamp: new Date() },
    };
    
    const id = await saveGeneration(generation);
    expect(id).toBeDefined();
    
    const retrieved = await getGenerations();
    expect(retrieved.length).toBeGreaterThan(0);
  });
});
