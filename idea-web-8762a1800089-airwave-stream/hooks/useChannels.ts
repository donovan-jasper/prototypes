import { useState, useEffect } from 'react';
import { getChannelList } from '../lib/tuner';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '../constants/Config';

export interface Channel {
  id: string;
  name: string;
  number: string;
  currentShow?: string;
}

export const useChannels = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        setLoading(true);
        
        // Check if we have a tuner configured
        const tunerConfig = await AsyncStorage.getItem('tunerConfig');
        
        if (tunerConfig) {
          // Try to get actual channels from tuner
          const parsedConfig = JSON.parse(tunerConfig);
          const tunerChannels = await getChannelList(parsedConfig);
          setChannels(tunerChannels);
        } else {
          // Use default channels for demo
          setChannels(Config.DEFAULT_CHANNELS);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching channels:', err);
        setError('Failed to load channels. Please check your tuner connection.');
        // Fallback to default channels
        setChannels(Config.DEFAULT_CHANNELS);
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, []);

  return { channels, loading, error };
};
