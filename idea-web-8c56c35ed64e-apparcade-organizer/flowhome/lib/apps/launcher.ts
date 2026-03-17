import { Linking, Platform, Alert } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';

export const launchApp = async (packageName: string) => {
  if (Platform.OS !== 'android') {
    Alert.alert('Error', 'App launching is only supported on Android');
    return;
  }

  try {
    // Try to launch using intent
    await IntentLauncher.startActivityAsync('android.intent.action.MAIN', {
      packageName: packageName,
      flags: 268435456, // FLAG_ACTIVITY_NEW_TASK
    });
    console.log(`Successfully launched ${packageName}`);
  } catch (error) {
    console.error(`Failed to launch ${packageName}:`, error);
    
    // Fallback: try using Linking
    try {
      const url = `intent://#Intent;package=${packageName};end`;
      const canOpen = await Linking.canOpenURL(url);
      
      if (canOpen) {
        await Linking.openURL(url);
        console.log(`Launched ${packageName} via Linking fallback`);
      } else {
        Alert.alert(
          'Cannot Launch App',
          `Unable to open ${packageName}. The app may not be installed or may not support launching.`,
          [{ text: 'OK' }]
        );
      }
    } catch (fallbackError) {
      console.error(`Fallback launch failed for ${packageName}:`, fallbackError);
      Alert.alert(
        'Launch Failed',
        `Could not open the app. Please ensure it is installed.`,
        [{ text: 'OK' }]
      );
    }
  }
};
