import { useState, useEffect } from 'react';
import { getInstalledApps } from '../lib/appManager';

export const useApps = () => {
  const [apps, setApps] = useState([]);

  useEffect(() => {
    const fetchApps = async () => {
      const installedApps = await getInstalledApps();
      setApps(installedApps);
    };

    fetchApps();
  }, []);

  return { apps };
};
