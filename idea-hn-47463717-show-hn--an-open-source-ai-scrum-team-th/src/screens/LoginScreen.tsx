import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as AuthSession from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleGitHubLogin = async () => {
    setLoading(true);
    try {
      // GitHub OAuth configuration
      const config = {
        clientId: 'YOUR_GITHUB_CLIENT_ID', // Replace with your actual client ID
        scopes: ['repo', 'user', 'notifications'],
        redirectUri: AuthSession.makeRedirectUri({
          useProxy: true,
        }),
      };

      // Start the OAuth flow
      const result = await AuthSession.startAsync({
        authUrl:
          `https://github.com/login/oauth/authorize?` +
          `client_id=${config.clientId}` +
          `&redirect_uri=${encodeURIComponent(config.redirectUri)}` +
          `&scope=${encodeURIComponent(config.scopes.join(' '))}`,
      });

      if (result.type === 'success') {
        // Exchange the authorization code for an access token
        const response = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            client_id: config.clientId,
            client_secret: 'YOUR_GITHUB_CLIENT_SECRET', // Replace with your actual client secret
            code: result.params.code,
            redirect_uri: config.redirectUri,
          }),
        });

        const data = await response.json();

        if (data.access_token) {
          // Store the token securely
          await AsyncStorage.setItem('githubToken', data.access_token);

          // Verify the token by fetching user data
          const userResponse = await fetch('https://api.github.com/user', {
            headers: {
              Authorization: `token ${data.access_token}`,
            },
          });

          if (userResponse.ok) {
            const userData = await userResponse.json();
            await AsyncStorage.setItem('githubUser', JSON.stringify(userData));
            navigation.navigate('RepositorySelection');
          } else {
            throw new Error('Failed to fetch user data');
          }
        } else {
          throw new Error(data.error || 'Failed to get access token');
        }
      } else {
        throw new Error('Authentication cancelled');
      }
    } catch (error) {
      console.error('GitHub login error:', error);
      Alert.alert('Login Failed', error.message || 'Could not authenticate with GitHub');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CodePilot</Text>
      <Text style={styles.subtitle}>Connect your GitHub account</Text>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleGitHubLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.loginButtonText}>Login with GitHub</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    color: '#666',
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#24292e',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoginScreen;
