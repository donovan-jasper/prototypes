import { useState, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { getInstalledApps } from '../lib/appManager';
import { saveApps, getApps } from '../lib/database';

export const useApps = () => {
  const { apps, setApps } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadApps = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // First try to get apps from database
      const cachedApps = await getApps();

      if (cachedApps.length > 0) {
        setApps(cachedApps);
        return;
      }

      // If no cached apps, fetch from device
      const installedApps = await getInstalledApps();

      // Save to database
      await saveApps(installedApps);

      setApps(installedApps);
    } catch (err) {
      console.error('Error loading apps:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshApps = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const installedApps = await getInstalledApps();
      await saveApps(installedApps);
      setApps(installedApps);
    } catch (err) {
      console.error('Error refreshing apps:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    apps,
    isLoading,
    error,
    loadApps,
    refreshApps,
  };
};
