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
        return response.data;
      } catch (error) {
        lastError = error as Error;
        if (attempt < MAX_RETRIES - 1) {
          const delay = INITIAL_DELAY * Math.pow(2, attempt);
          await sleep(delay);
        }
      }
    }
    
    console.log('API failed after retries, loading mock channels');
    insertChannels(DEFAULT_CHANNELS);
    return DEFAULT_CHANNELS;
  } catch (error) {
    console.error('Error fetching channels:', error);
    insertChannels(DEFAULT_CHANNELS);
    return DEFAULT_CHANNELS;
  }
};
