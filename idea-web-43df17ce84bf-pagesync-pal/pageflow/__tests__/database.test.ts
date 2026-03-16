import { addMedia, updateProgress, getActiveMedia } from '../lib/database';

describe('Database operations', () => {
  test('adds new media item', async () => {
    const media = await addMedia({
      id: 'test1',
      title: 'Test Book',
      type: 'book',
      currentProgress: 0,
      totalProgress: 400,
      unit: 'page',
      lastUpdated: new Date(),
    });
    expect(media).toBeDefined();
  });

  test('updates progress', async () => {
    const updated = await updateProgress('test1', 200);
    expect(updated).toBeDefined();
  });

  test('retrieves active media', async () => {
    const active = await getActiveMedia();
    expect(Array.isArray(active)).toBe(true);
  });
});
