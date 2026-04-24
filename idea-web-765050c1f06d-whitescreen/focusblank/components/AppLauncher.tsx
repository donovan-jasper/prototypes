import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Platform, Linking, Alert } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';

interface AppLauncherProps {
  packageName: string;
  fallbackUrl?: string;
  children: React.ReactNode;
}

const AppLauncher: React.FC<AppLauncherProps> = ({ packageName, fallbackUrl, children }) => {
  const [isLoading, setIsLoading] = useState(false);

  const launchApp = async () => {
    setIsLoading(true);
    try {
      if (Platform.OS === 'android') {
        // For Android, use expo-intent-launcher
        await IntentLauncher.startActivityAsync(packageName);
      } else if (Platform.OS === 'ios') {
        // For iOS, try URL scheme first, then fallback to App Store
        const url = `${packageName}://`;
        const canOpen = await Linking.canOpenURL(url);

        if (canOpen) {
          await Linking.openURL(url);
        } else if (fallbackUrl) {
          // If app isn't installed, open App Store link
          await Linking.openURL(fallbackUrl);
        } else {
          Alert.alert(
            'App Not Found',
            'This app is not installed on your device.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('Error launching app:', error);
      Alert.alert(
        'Error',
        'Failed to launch the app. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={launchApp}
      disabled={isLoading}
    >
      {isLoading ? (
        <Text style={styles.loadingText}>Launching...</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  loadingText: {
    color: '#666',
    fontSize: 16,
  },
});

export default AppLauncher;
