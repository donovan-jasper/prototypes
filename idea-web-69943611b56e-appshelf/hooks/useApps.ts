import { useAppStore } from '../store/appStore';
import { getInstalledApps } from '../lib/appManager';

export const useApps = () => {
  const { apps, setApps } = useAppStore();

  const loadApps = async () => {
    try {
      const installedApps = await getInstalledApps();
      setApps(installedApps);
    } catch (error) {
      console.error('Error loading apps:', error);
    }
  };

  return {
    apps,
    loadApps,
  };
};
