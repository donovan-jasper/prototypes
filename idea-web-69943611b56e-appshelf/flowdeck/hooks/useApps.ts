import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { getInstalledApps, cacheApps, getCachedApps } from '../lib/appManager';
import { useStore } from '../store/appStore';

export const useApps = () => {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setApps: setStoreApps } = useStore();

  useEffect(() => {
    const fetchApps = async () => {
      try {
        setLoading(true);
        
        if (Platform.OS === 'ios') {
          setError('iOS does not support listing installed apps. FlowDeck works as a widget-based quick launcher on iOS.');
          setLoading(false);
          return;
        }

        const cachedApps = await getCachedApps();
        
        if (cachedApps.length > 0) {
          setApps(cachedApps);
          setStoreApps(cachedApps);
        }

        const installedApps = await getInstalledApps();
        
        if (installedApps.length > 0) {
          await cacheApps(installedApps);
          setApps(installedApps);
          setStoreApps(installedApps);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching apps:', err);
        setError('Failed to load apps');
        setLoading(false);
      }
    };

    fetchApps();
  }, []);

  return { apps, loading, error };
};
