import { Linking } from 'react-native';

export async function launchApp(packageName: string): Promise<void> {
  try {
    // For Android
    if (packageName.startsWith('com.')) {
      await Linking.openURL(`intent://#Intent;package=${packageName};end`);
    }
    // For iOS (limited support)
    else {
      await Linking.openURL(`flowhome://app/${packageName}`);
    }
  } catch (error) {
    console.error('Failed to launch app:', error);
    throw new Error('Could not launch the app');
  }
}
