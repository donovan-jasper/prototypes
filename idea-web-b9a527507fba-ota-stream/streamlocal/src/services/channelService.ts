import axios from 'axios';
import { getCurrentLocation } from './locationService';
import { DEFAULT_CHANNELS } from '../utils/constants';
import { insertChannels } from './database';

const API_BASE_URL = 'https://api.streamlocal.com';
const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchChannels = async () => {
  let lastError: Error | null = null;

  try {
    const location = await getCurrentLocation();

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const response = await axios.get(`${API_BASE_URL}/channels`, {
          params: { city: location.city, region: location.region },
          timeout: 5000,
        });

        // Validate the response structure
        if (response.data && Array.isArray(response.data.channels)) {
          const channels = response.data.channels.map((channel: any) => ({
            id: channel.id || `channel-${Math.random().toString(36).substr(2, 9)}`,
            name: channel.name || 'Unknown Channel',
            streamUrl: channel.streamUrl || '',
            logoUrl: channel.logoUrl || '',
            currentProgram: channel.currentProgram || 'No program information',
            nextProgram: channel.nextProgram || 'No upcoming program',
          }));

          // Cache channels in database
          await insertChannels(channels);
          return channels;
        }
      } catch (error) {
        lastError = error as Error;
        if (attempt < MAX_RETRIES - 1) {
          const delay = INITIAL_DELAY * Math.pow(2, attempt);
          await sleep(delay);
        }
      }
    }

    console.log('API failed after retries, loading mock channels');
    await insertChannels(DEFAULT_CHANNELS);
    return DEFAULT_CHANNELS;
  } catch (error) {
    console.error('Error fetching channels:', error);
    await insertChannels(DEFAULT_CHANNELS);
    return DEFAULT_CHANNELS;
  }
};

export const getCachedChannels = async () => {
  try {
    // Implementation would query the database for cached channels
    // For now, return the default channels
    return DEFAULT_CHANNELS;
  } catch (error) {
    console.error('Error getting cached channels:', error);
    return DEFAULT_CHANNELS;
  }
};
