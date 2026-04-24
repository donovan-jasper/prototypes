import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Text, ActivityIndicator, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { GitProviderService } from '../../src/services/git/GitProviderService';
import { useAuthStore } from '../../src/stores/useAuthStore';

const LoginScreen = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setCredentials } = useAuthStore();

  const handleLogin = async (provider: 'github' | 'gitlab' | 'bitbucket') => {
    try {
      setLoading(true);
      const authUrl = await GitProviderService.getAuthUrl(provider);

      // In a real app, you would use expo-auth-session to open the auth URL
      // For this example, we'll simulate the callback
      // In production, you would handle the callback in oauth-callback.tsx

      // Simulate successful auth
      const token = 'simulated_token_' + provider;
      const credentials = await GitProviderService.handleAuthCallback(provider, 'simulated_code');

      setCredentials(credentials);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Login Error', error instanceof Error ? error.message : 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Welcome to GitFlow
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Sign in with your Git provider to get started
      </Text>

      {loading ? (
        <ActivityIndicator size="large" style={styles.loading} />
      ) : (
        <>
          <Button
            mode="contained"
            icon="github"
            onPress={() => handleLogin('github')}
            style={styles.button}
          >
            Sign in with GitHub
          </Button>

          <Button
            mode="contained"
            icon="gitlab"
            onPress={() => handleLogin('gitlab')}
            style={styles.button}
          >
            Sign in with GitLab
          </Button>

          <Button
            mode="contained"
            icon="bitbucket"
            onPress={() => handleLogin('bitbucket')}
            style={styles.button}
          >
            Sign in with Bitbucket
          </Button>

          <Divider style={styles.divider} />

          <Button
            mode="outlined"
            onPress={() => router.push('/(tabs)')}
            style={styles.demoButton}
          >
            Continue as Guest (Demo Mode)
          </Button>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 30,
    textAlign: 'center',
    color: '#666',
  },
  button: {
    marginBottom: 10,
    paddingVertical: 8,
  },
  divider: {
    marginVertical: 20,
  },
  demoButton: {
    marginTop: 10,
  },
  loading: {
    marginTop: 20,
  },
});

export default LoginScreen;
