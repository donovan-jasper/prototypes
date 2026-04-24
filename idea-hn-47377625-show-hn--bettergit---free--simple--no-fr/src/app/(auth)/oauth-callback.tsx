import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { GitProviderService } from '../../src/services/git/GitProviderService';
import { useAuthStore } from '../../src/stores/useAuthStore';

const OAuthCallbackScreen = () => {
  const { code, provider } = useLocalSearchParams();
  const router = useRouter();
  const { setCredentials } = useAuthStore();

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (!code || !provider) {
        router.replace('/(auth)/login');
        return;
      }

      try {
        const credentials = await GitProviderService.handleAuthCallback(provider as any, code as string);
        setCredentials(credentials);
        router.replace('/(tabs)');
      } catch (error) {
        console.error('Auth callback error:', error);
        router.replace('/(auth)/login');
      }
    };

    handleAuthCallback();
  }, [code, provider, router, setCredentials]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
      <Text style={styles.text}>Completing authentication...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});

export default OAuthCallbackScreen;
