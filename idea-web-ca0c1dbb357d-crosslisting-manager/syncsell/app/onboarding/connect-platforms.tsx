import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { usePlatformStore } from '../../lib/store/usePlatformStore';

export default function ConnectPlatformsScreen() {
  const router = useRouter();
  const { connectPlatform } = usePlatformStore();

  const handleConnectPlatform = (platformName) => {
    // Mock OAuth flow
    connectPlatform(platformName);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connect Your Platforms</Text>
      <Text style={styles.subtitle}>
        Connect your social commerce platforms to start selling everywhere.
      </Text>
      <TouchableOpacity
        style={styles.platformButton}
        onPress={() => handleConnectPlatform('TikTok Shop')}
      >
        <Text style={styles.platformButtonText}>Connect TikTok Shop</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.platformButton}
        onPress={() => handleConnectPlatform('Instagram Shopping')}
      >
        <Text style={styles.platformButtonText}>Connect Instagram Shopping</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.platformButton}
        onPress={() => handleConnectPlatform('Facebook Marketplace')}
      >
        <Text style={styles.platformButtonText}>Connect Facebook Marketplace</Text>
      </TouchableOpacity>
      <Button
        mode="outlined"
        onPress={() => router.push('/(tabs)')}
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
  platformButtonText: {
    fontSize: 16,
  },
  skipButton: {
    marginTop: 16,
  },
});
