import * as Application from 'expo-application';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

interface AppInfo {
  id: string;
  name: string;
  packageName: string;
  icon?: string;
}

export async function scanInstalledApps(): Promise<AppInfo[]> {
  if (Platform.OS === 'android') {
    try {
      const installedApps = await Application.getInstalledApplicationsAsync();
      return installedApps.map(app => ({
        id: app.id,
        name: app.name,
        packageName: app.packageName,
        icon: app.icon
      }));
    } catch (error) {
      console.error('Error scanning installed apps:', error);
      return [];
    }
  } else if (Platform.OS === 'ios') {
    // iOS doesn't allow listing all installed apps, so we'll return a limited set
    // This would need to be implemented differently for iOS (possibly using a widget)
    return [];
  }
  return [];
}
