import { initDB, createChannel, getChannels } from '../app/utils/channel';

describe('Channel Management', () => {
  beforeAll(() => {
    initDB();
  });

  it('creates a new channel', async () => {
    const channel = await createChannel('Work');
    expect(channel.name).toBe('Work');
    expect(channel.id).toBeDefined();
  });

  it('retrieves all channels', async () => {
    const channels = await getChannels();
    expect(channels.length).toBeGreaterThan(0);
  });
});
