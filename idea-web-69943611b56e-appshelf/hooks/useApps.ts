import { useAppStore } from '../store/appStore';
import { getInstalledApps } from '../lib/appManager';

export const useApps = () => {
  const { apps, setApps } = useAppStore();

  const loadApps = async () => {
    const installedApps = await getInstalledApps();
    setApps(installedApps);
  };

  return {
    apps,
    loadApps,
  };
};
