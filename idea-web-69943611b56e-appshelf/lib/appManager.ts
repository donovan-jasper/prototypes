import * as Application from 'expo-application';
import { Platform } from 'react-native';

export const getInstalledApps = async () => {
  if (Platform.OS === 'ios') {
    // iOS doesn't allow listing installed apps
    return [];
  }

  try {
    // This is a simplified version - in a real app you'd need a native module
    // to get the complete list of installed apps with icons
    const packageName = Application.applicationId;
    return [
      {
        packageName: packageName || 'com.example.app',
        label: 'Example App',
        icon: undefined,
      },
    ];
  } catch (error) {
    console.error('Error getting installed apps:', error);
    return [];
  }
};
