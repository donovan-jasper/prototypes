import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useInventoryStore } from '../../lib/stores/inventoryStore';
import { fetchFortniteInventory } from '../../lib/api/gameApis';

WebBrowser.maybeCompleteAuthSession();

const Profile = () => {
  const [isFortniteConnected, setIsFortniteConnected] = useState(false);
  const { addItem } = useInventoryStore();

  // Epic Games OAuth configuration
  const discovery = {
    authorizationEndpoint: 'https://www.epicgames.com/id/authorize',
    tokenEndpoint: 'https://api.epicgames.dev/epic/oauth/v1/token',
  };

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: 'YOUR_EPIC_GAMES_CLIENT_ID',
      scopes: ['basic_profile', 'fortnite'],
      redirectUri: AuthSession.makeRedirectUri({
        useProxy: true,
      }),
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
      handleEpicGamesAuth(code);
    }
  }, [response]);

  const handleEpicGamesAuth = async (code: string) => {
    try {
      // Exchange code for access token
      const tokenResponse = await fetch(discovery.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(AuthSession.makeRedirectUri({ useProxy: true }))}`,
      });

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // Fetch Fortnite inventory using the access token
      const inventory = await fetchFortniteInventoryWithToken(accessToken);

      // Add items to store
      inventory.forEach(item => addItem(item));

      setIsFortniteConnected(true);
      Alert.alert('Success', 'Fortnite account connected successfully!');
    } catch (error) {
      console.error('Error during Epic Games auth:', error);
      Alert.alert('Error', 'Failed to connect Fortnite account');
    }
  };

  const fetchFortniteInventoryWithToken = async (accessToken: string) => {
    try {
      // In a real implementation, this would call the actual Fortnite API
      // For this prototype, we'll use the mock data but simulate authentication
      const mockInventory = await fetchFortniteInventory();

      // Add a simulated authentication check
      if (!accessToken) {
        throw new Error('Invalid access token');
      }

      return mockInventory.map(item => ({
        ...item,
        authenticated: true
      }));
    } catch (error) {
      console.error('Error fetching Fortnite inventory:', error);
      throw error;
    }
  };

  const handleConnectFortnite = async () => {
    if (!request) {
      Alert.alert('Error', 'Authentication request not initialized');
      return;
    }

    try {
      const result = await promptAsync();
      if (result.type !== 'success') {
        Alert.alert('Error', 'Authentication failed');
      }
    } catch (error) {
      console.error('Error connecting Fortnite:', error);
      Alert.alert('Error', 'Failed to connect Fortnite account');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Account Connections</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fortnite</Text>
        <Text style={styles.sectionDescription}>
          Connect your Epic Games account to sync your Fortnite inventory.
        </Text>

        <TouchableOpacity
          style={[
            styles.button,
            isFortniteConnected ? styles.connectedButton : styles.connectButton
          ]}
          onPress={handleConnectFortnite}
          disabled={isFortniteConnected}
        >
          <Text style={styles.buttonText}>
            {isFortniteConnected ? 'Connected' : 'Connect Fortnite'}
          </Text>
        </TouchableOpacity>

        {isFortniteConnected && (
          <Text style={styles.connectedStatus}>
            Your Fortnite inventory will be synced automatically
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Other Games</Text>
        <Text style={styles.sectionDescription}>
          Connect more games to build your complete inventory portfolio.
        </Text>

        <TouchableOpacity style={styles.button} disabled>
          <Text style={styles.buttonText}>Connect Genshin Impact (Coming Soon)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} disabled>
          <Text style={styles.buttonText}>Connect Destiny 2 (Coming Soon)</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  connectButton: {
    backgroundColor: '#3a86ff',
  },
  connectedButton: {
    backgroundColor: '#4caf50',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  connectedStatus: {
    color: '#4caf50',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
});

export default Profile;
