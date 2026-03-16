import * as Application from 'expo-application';
import { saveMode, getModes } from './database';

export const getInstalledApps = async () => {
  try {
    const apps = await Application.getInstalledApplicationsAsync();
    return apps.map(app => ({
      packageName: app.packageName,
      label: app.label,
      icon: app.icon,
    }));
  } catch (error) {
    console.error('Error getting installed apps:', error);
    return [];
  }
};

export const cacheApps = async () => {
  const apps = await getInstalledApps();
  // Save to database
  // Implementation depends on your database schema
};
