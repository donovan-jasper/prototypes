import axios from 'axios';
import { fetchChannels } from './channelService';
import { getCurrentLocation } from './locationService';
import { DEFAULT_CHANNELS } from '../utils/constants';
import { insertChannels } from './database';

jest.mock('axios');
jest.mock('./locationService');
jest.mock('./database');

describe('channelService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  it('retries API call with exponential backoff and returns mock data after failures', async () => {
    (getCurrentLocation as jest.Mock).mockResolvedValue({ city: 'Seattle', region: 'Washington' });
    (axios.get as jest.Mock).mockRejectedValue(new Error('Network Error'));

    const channels = await fetchChannels();
    
    expect(axios.get).toHaveBeenCalledTimes(3);
    expect(insertChannels).toHaveBeenCalledWith(DEFAULT_CHANNELS);
    expect(channels).toEqual(DEFAULT_CHANNELS);
  });

  it('returns mock data when location fails', async () => {
    (getCurrentLocation as jest.Mock).mockRejectedValue(new Error('Location Error'));

    const channels = await fetchChannels();
    
    expect(insertChannels).toHaveBeenCalledWith(DEFAULT_CHANNELS);
    expect(channels).toEqual(DEFAULT_CHANNELS);
  });
});
