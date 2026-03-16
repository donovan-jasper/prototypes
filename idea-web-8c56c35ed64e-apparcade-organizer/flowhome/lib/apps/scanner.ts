import * as Application from 'expo-application';

export const scanInstalledApps = async () => {
  const apps = await Application.getInstalledApplicationsAsync();
  return apps.map((app) => ({
    id: app.id,
    name: app.name,
    icon: app.icon,
  }));
};
