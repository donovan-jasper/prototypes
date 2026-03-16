import axios from 'axios';
import { getCurrentLocation } from './locationService';

const API_BASE_URL = 'https://api.streamlocal.com';

export const fetchChannels = async () => {
  try {
    const location = await getCurrentLocation();
    const response = await axios.get(`${API_BASE_URL}/channels`, {
      params: { city: location.city, region: location.region },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching channels:', error);
    throw error;
  }
};
