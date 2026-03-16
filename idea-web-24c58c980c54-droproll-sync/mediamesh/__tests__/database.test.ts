import { initDatabase, insertMedia, getMediaBySource } from '../database/queries';

describe('Database Operations', () => {
  beforeEach(async () => {
    await initDatabase();
  });

  it('should store and retrieve media metadata', async () => {
    await insertMedia({
      cloudId: 'dropbox-123',
      source: 'dropbox',
      localPath: 'file:///media/photo.jpg',
      hash: 'abc123',
      syncedAt: Date.now()
    });

    const media = await getMediaBySource('dropbox');
    expect(media).toHaveLength(1);
    expect(media[0].cloudId).toBe('dropbox-123');
  });
});
