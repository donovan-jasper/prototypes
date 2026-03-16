import { Linking } from 'react-native';

export const launchApp = async (packageName: string) => {
  try {
    await Linking.openURL(`intent://${packageName}#Intent;package=${packageName};end`);
  } catch (error) {
    console.error('Error launching app:', error);
  }
};
