import { syncCloudService } from '../services/cloudSync';
import { getMediaFromDropbox } from '../services/dropboxService';

jest.mock('../services/dropboxService');

describe('Cloud Sync', () => {
  it('should fetch and store media from connected cloud', async () => {
    (getMediaFromDropbox as jest.Mock).mockResolvedValue([
      { id: '1', name: 'photo.jpg', path: '/photos/photo.jpg' }
    ]);

    const result = await syncCloudService('dropbox', 'mock-token');
    expect(result.synced).toBe(1);
    expect(result.errors).toBe(0);
  });
});
