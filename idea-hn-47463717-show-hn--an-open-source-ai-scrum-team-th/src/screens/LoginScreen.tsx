import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { GitHub } from 'react-native-github-api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleGitHubLogin = async () => {
    setLoading(true);
    try {
      const github = new GitHub({
        clientId: 'YOUR_GITHUB_CLIENT_ID',
        clientSecret: 'YOUR_GITHUB_CLIENT_SECRET',
        redirectUri: 'YOUR_REDIRECT_URI',
      });

      const authUrl = github.getAuthUrl({
        scopes: ['repo', 'user'],
        state: 'random_string',
      });

      // In a real app, you would open this URL in a WebView or browser
      // For this example, we'll simulate the OAuth flow
      const token = await github.authenticate({
        type: 'token',
        token: 'YOUR_TEST_TOKEN', // Replace with actual token from OAuth flow
      });

      await AsyncStorage.setItem('githubToken', token);
      navigation.navigate('RepositorySelection');
    } catch (error) {
      console.error('GitHub login error:', error);
      Alert.alert('Login Failed', 'Could not authenticate with GitHub');
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
        <Text style={styles.loginButtonText}>
          {loading ? 'Connecting...' : 'Login with GitHub'}
        </Text>
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
  },
  loginButton: {
    backgroundColor: '#24292e',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    width: '100%',
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoginScreen;
