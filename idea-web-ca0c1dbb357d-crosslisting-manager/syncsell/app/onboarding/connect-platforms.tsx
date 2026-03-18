import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import usePlatformStore from '../../lib/store/usePlatformStore';

export default function ConnectPlatformsScreen() {
  const router = useRouter();
  const { connectPlatform } = usePlatformStore();
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);

  const handleConnectPlatform = (platformName: string) => {
    // Mock OAuth flow - simulate successful connection
    const platform = {
      name: platformName,
      apiKey: `mock-api-key-${Date.now()}`,
      connectedAt: new Date().toISOString(),
    };

    connectPlatform(platform, () => {
      setConnectedPlatforms([...connectedPlatforms, platformName]);
      Alert.alert('Success', `${platformName} connected successfully!`);
    });
  };

  const handleContinue = async () => {
    // Set onboarding flag
    await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
    router.replace('/(tabs)');
  };

  const handleSkip = async () => {
    // Set onboarding flag even when skipping
    await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connect Your Platforms</Text>
      <Text style={styles.subtitle}>
        Connect your social commerce platforms to start selling everywhere.
      </Text>
      <TouchableOpacity
        style={[
          styles.platformButton,
          connectedPlatforms.includes('TikTok Shop') && styles.connectedButton,
        ]}
        onPress={() => handleConnectPlatform('TikTok Shop')}
      >
        <Text style={styles.platformButtonText}>
          {connectedPlatforms.includes('TikTok Shop') ? '✓ ' : ''}Connect TikTok Shop
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.platformButton,
          connectedPlatforms.includes('Instagram Shopping') && styles.connectedButton,
        ]}
        onPress={() => handleConnectPlatform('Instagram Shopping')}
      >
        <Text style={styles.platformButtonText}>
          {connectedPlatforms.includes('Instagram Shopping') ? '✓ ' : ''}Connect Instagram Shopping
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.platformButton,
          connectedPlatforms.includes('Facebook Marketplace') && styles.connectedButton,
        ]}
        onPress={() => handleConnectPlatform('Facebook Marketplace')}
      >
        <Text style={styles.platformButtonText}>
          {connectedPlatforms.includes('Facebook Marketplace') ? '✓ ' : ''}Connect Facebook Marketplace
        </Text>
      </TouchableOpacity>
      {connectedPlatforms.length > 0 && (
        <Button
          mode="contained"
          onPress={handleContinue}
          style={styles.continueButton}
        >
          Continue
        </Button>
      )}
      <Button
        mode="outlined"
        onPress={handleSkip}
        style={styles.skipButton}
      >
        Skip for Now
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  platformButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  connectedButton: {
    backgroundColor: '#e8f5e9',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  platformButtonText: {
    fontSize: 16,
  },
  continueButton: {
    marginTop: 16,
    marginBottom: 8,
  },
  skipButton: {
    marginTop: 8,
  },
});
