import axios from 'axios';
import { fetchChannels } from './channelService';
import { getCurrentLocation } from './locationService';

jest.mock('axios');
jest.mock('./locationService');

describe('channelService', () => {
  it('returns channels for the current location', async () => {
    (getCurrentLocation as jest.Mock).mockResolvedValue({ city: 'Seattle', region: 'Washington' });
    (axios.get as jest.Mock).mockResolvedValue({
      data: [
        { id: '1', name: 'ABC News', logo: 'https://example.com/abc-logo.png', currentProgram: 'Breaking News', nextProgram: 'Weather Update' },
        { id: '2', name: 'NBC News', logo: 'https://example.com/nbc-logo.png', currentProgram: 'Nightly News', nextProgram: 'Sports Highlights' },
      ],
    });

    const channels = await fetchChannels();
    expect(channels).toEqual([
      { id: '1', name: 'ABC News', logo: 'https://example.com/abc-logo.png', currentProgram: 'Breaking News', nextProgram: 'Weather Update' },
      { id: '2', name: 'NBC News', logo: 'https://example.com/nbc-logo.png', currentProgram: 'Nightly News', nextProgram: 'Sports Highlights' },
    ]);
  });

  it('throws an error when fetching channels fails', async () => {
    (getCurrentLocation as jest.Mock).mockResolvedValue({ city: 'Seattle', region: 'Washington' });
    (axios.get as jest.Mock).mockRejectedValue(new Error('Network Error'));

    await expect(fetchChannels()).rejects.toThrow('Network Error');
  });
});
