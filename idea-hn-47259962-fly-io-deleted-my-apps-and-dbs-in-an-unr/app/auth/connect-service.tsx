import { useState } from 'react';
import { View, Button, StyleSheet, ActivityIndicator, Text, Alert } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import { FlyioClient } from '@/lib/cloudProviders/flyio';
import { useStore } from '@/lib/store';
import { openDatabase, saveService } from '@/lib/db';

export default function ConnectServiceScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addService = useStore((state) => state.addService);

  async function connectFlyio() {
    setLoading(true);
    setError(null);

    try {
      const redirectUri = AuthSession.makeRedirectUri();
      const authUrl = `https://fly.io/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=${redirectUri}&response_type=token`;

      const result = await AuthSession.startAsync({ authUrl });

      if (result.type === 'success') {
        const token = result.params.access_token;
        if (!token) throw new Error('No access token received');

        // Store token securely
        await SecureStore.setItemAsync('auth_token_flyio', token);

        // Get apps and save to database
        const client = new FlyioClient(token);
        const apps = await client.getApps();

        if (apps.length === 0) {
          Alert.alert('No Apps Found', 'You don\'t have any apps in your Fly.io account.');
          return;
        }

        const db = await openDatabase();

        for (const app of apps) {
          const status = await client.getAppStatus(app.name);
          const serviceData = {
            id: app.id,
            name: app.name,
            provider: 'flyio',
            status,
            metadata: {
              organizationId: app.organization?.id
            }
          };

          await saveService(db, serviceData);
          addService(serviceData);
        }

        Alert.alert('Success', 'Successfully connected Fly.io account and imported apps!');
      }
    } catch (err) {
      console.error('Connection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect to Fly.io');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connect Cloud Services</Text>
      <Text style={styles.description}>
        Connect your cloud accounts to monitor services and receive alerts.
      </Text>

      <View style={styles.buttonContainer}>
        <Button
          title="Connect Fly.io"
          onPress={connectFlyio}
          disabled={loading}
        />
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Connecting to Fly.io...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <Button
            title="Try Again"
            onPress={connectFlyio}
            color="#EF4444"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1F2937',
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  buttonContainer: {
    marginBottom: 16,
  },
  loadingContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    marginBottom: 12,
  },
});
