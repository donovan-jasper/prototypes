import { useState } from 'react';
import { GitHub } from 'react-native-github-api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useGitHubAuth = () => {
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const login = async () => {
    setLoading(true);
    try {
      const github = new GitHub({
        clientId: 'YOUR_GITHUB_CLIENT_ID',
        clientSecret: 'YOUR_GITHUB_CLIENT_SECRET',
        redirectUri: 'YOUR_REDIRECT_URI',
      });

      // In a real app, you would implement the full OAuth flow
      // This is a simplified version for demonstration
      const authToken = 'YOUR_TEST_TOKEN'; // Replace with actual token from OAuth flow
      await AsyncStorage.setItem('githubToken', authToken);
      setToken(authToken);
      return { success: true };
    } catch (error) {
      console.error('GitHub login error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('githubToken');
    setToken(null);
  };

  const getToken = async () => {
    if (token) return token;
    const storedToken = await AsyncStorage.getItem('githubToken');
    setToken(storedToken);
    return storedToken;
  };

  return {
    loading,
    token,
    login,
    logout,
    getToken,
  };
};

export default useGitHubAuth;
