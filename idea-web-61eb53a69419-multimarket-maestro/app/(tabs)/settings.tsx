import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, ActivityIndicator } from 'react-native';
import { Text, Card, Button, Switch, Snackbar, Divider, IconButton } from 'react-native-paper';
import { useAppStore } from '../../store/app-store';
import { Platform } from '../../types';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import { useFocusEffect } from '@react-navigation/native';

const platformInfo: Record<Platform, { label: string; color: string; icon: string }> = {
  ebay: { label: 'eBay', color: '#E53238', icon: 'shopping-outline' },
  etsy: { label: 'Etsy', color: '#F1641E', icon: 'storefront-outline' },
  depop: { label: 'Depop', color: '#FF0000', icon: 'camera-outline' },
  poshmark: { label: 'Poshmark', color: '#630F3E', icon: 'shirt-outline' },
  facebook: { label: 'Facebook Marketplace', color: '#1877F2', icon: 'logo-facebook' },
};

export default function SettingsScreen() {
  const { platforms, togglePlatform, isOnline } = useAppStore();
  const [autoSync, setAutoSync] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [refreshingToken, setRefreshingToken] = useState<string | null>(null);

  const connectedPlatforms = platforms.filter(p => p.enabled).length;
  const isFreeTier = true;
  const maxPlatforms = isFreeTier ? 2 : Infinity;
  const maxListings = isFreeTier ? 25 : Infinity;

  useFocusEffect(
    React.useCallback(() => {
      // Check for OAuth callback when screen comes into focus
      const checkOAuthCallback = async () => {
        const token = await SecureStore.getItemAsync('oauth_token');
        if (token) {
          await SecureStore.deleteItemAsync('oauth_token');
          const platform = await SecureStore.getItemAsync('connecting_platform');
          if (platform) {
            await SecureStore.deleteItemAsync('connecting_platform');
            setConnectingPlatform(null);
            setSnackbarMessage(`${platformInfo[platform as Platform].label} connected successfully`);
            setSnackbarVisible(true);
          }
        }
      };

      checkOAuthCallback();
    }, [])
  );

  const handleConnect = async (platformId: string, platformName: Platform) => {
    setConnectingPlatform(platformId);

    try {
      // Store the platform we're connecting to for the OAuth callback
      await SecureStore.setItemAsync('connecting_platform', platformName);

      // In a real app, this would open the OAuth flow in a WebBrowser
      const result = await WebBrowser.openAuthSessionAsync(
        `https://auth.${platformName}.com/oauth?client_id=YOUR_CLIENT_ID&redirect_uri=exp://your-app-url/oauth`,
        'exp://your-app-url/oauth'
      );

      if (result.type === 'success') {
        // The OAuth callback will handle storing the token
        // We'll check for it in the useFocusEffect
      } else {
        setConnectingPlatform(null);
        setSnackbarMessage(`Failed to connect to ${platformInfo[platformName].label}`);
        setSnackbarVisible(true);
      }
    } catch (error) {
      console.error('OAuth error:', error);
      setConnectingPlatform(null);
      setSnackbarMessage(`Error connecting to ${platformInfo[platformName].label}`);
      setSnackbarVisible(true);
    }
  };

  const handleDisconnect = async (platformId: string, platformName: Platform) => {
    try {
      await SecureStore.deleteItemAsync(`${platformName}_api_token`);
      await SecureStore.deleteItemAsync(`${platformName}_refresh_token`);
      togglePlatform(platformId);
      setSnackbarMessage(`${platformInfo[platformName].label} disconnected`);
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Disconnect error:', error);
      setSnackbarMessage(`Error disconnecting ${platformInfo[platformName].label}`);
      setSnackbarVisible(true);
    }
  };

  const handleRefreshToken = async (platformId: string, platformName: Platform) => {
    setRefreshingToken(platformId);

    try {
      // In a real app, this would call the platform's token refresh endpoint
      const newToken = `refreshed_${platformName}_token_${Date.now()}`;
      await SecureStore.setItemAsync(`${platformName}_api_token`, newToken);

      setSnackbarMessage(`${platformInfo[platformName].label} token refreshed`);
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Token refresh error:', error);
      setSnackbarMessage(`Failed to refresh ${platformInfo[platformName].label} token`);
      setSnackbarVisible(true);
    } finally {
      setRefreshingToken(null);
    }
  };

  const canConnectMore = connectedPlatforms < maxPlatforms;

  const formatLastSync = (lastSync?: string) => {
    if (!lastSync) return 'Never';
    const date = new Date(lastSync);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Card style={styles.subscriptionCard}>
          <Card.Content>
            <Text style={styles.tierTitle}>Free Tier</Text>
            <Text style={styles.tierDescription}>
              {connectedPlatforms}/{maxPlatforms} platforms connected
            </Text>
            <Text style={styles.tierDescription}>
              {maxListings} listings max
            </Text>
            {isFreeTier && (
              <Button
                mode="contained"
                style={styles.upgradeButton}
                onPress={() => {
                  setSnackbarMessage('Upgrade to Pro for unlimited platforms and listings');
                  setSnackbarVisible(true);
                }}
              >
                Upgrade to Pro - $9.99/month
              </Button>
            )}
          </Card.Content>
        </Card>

        <Text style={styles.sectionTitle}>Platform Connections</Text>

        {platforms.map((platform) => {
          const info = platformInfo[platform.name];
          const isConnecting = connectingPlatformId === platform.id;
          const isRefreshing = refreshingToken === platform.id;

          return (
            <Card key={platform.id} style={styles.platformCard}>
              <Card.Content>
                <View style={styles.platformHeader}>
                  <View style={styles.platformInfo}>
                    <View style={[styles.platformIcon, { backgroundColor: info.color }]} />
                    <View style={styles.platformDetails}>
                      <Text style={styles.platformName}>{info.label}</Text>
                      {platform.enabled && (
                        <>
                          <View style={styles.statusRow}>
                            <View style={styles.connectedDot} />
                            <Text style={styles.statusText}>Connected</Text>
                          </View>
                          <Text style={styles.lastSyncText}>
                            Last sync: {formatLastSync(platform.lastSync)}
                          </Text>
                        </>
                      )}
                      {!platform.enabled && (
                        <View style={styles.statusRow}>
                          <View style={styles.disconnectedDot} />
                          <Text style={[styles.statusText, styles.disconnectedText]}>Disconnected</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  {platform.enabled ? (
                    <View style={styles.actionButtons}>
                      <IconButton
                        icon="refresh"
                        size={20}
                        onPress={() => handleRefreshToken(platform.id, platform.name)}
                        disabled={isRefreshing}
                      />
                      <IconButton
                        icon="logout"
                        size={20}
                        onPress={() => handleDisconnect(platform.id, platform.name)}
                      />
                    </View>
                  ) : (
                    <Button
                      mode="contained"
                      onPress={() => handleConnect(platform.id, platform.name)}
                      disabled={!canConnectMore || isConnecting}
                      loading={isConnecting}
                    >
                      {isConnecting ? 'Connecting...' : 'Connect'}
                    </Button>
                  )}
                </View>
                {platform.enabled && (
                  <View style={styles.platformActions}>
                    <View style={styles.syncStatusContainer}>
                      <Text style={styles.syncStatusLabel}>Auto-sync:</Text>
                      <Switch
                        value={autoSync}
                        onValueChange={setAutoSync}
                        disabled={!isOnline}
                      />
                    </View>
                    {isRefreshing && (
                      <View style={styles.refreshingContainer}>
                        <ActivityIndicator size="small" color={info.color} />
                        <Text style={styles.refreshingText}>Refreshing token...</Text>
                      </View>
                    )}
                  </View>
                )}
              </Card.Content>
            </Card>
          );
        })}

        <Divider style={styles.divider} />

        <Text style={styles.sectionTitle}>Account</Text>
        <Card style={styles.accountCard}>
          <Card.Content>
            <Button
              mode="outlined"
              onPress={() => {
                setSnackbarMessage('Account settings coming soon');
                setSnackbarVisible(true);
              }}
            >
              Manage Account
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    padding: 16,
  },
  subscriptionCard: {
    marginBottom: 24,
    elevation: 2,
  },
  tierTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tierDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  upgradeButton: {
    marginTop: 16,
    backgroundColor: '#4CAF50',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  platformCard: {
    marginBottom: 16,
    elevation: 1,
  },
  platformHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  platformInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  platformIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  platformDetails: {
    flex: 1,
  },
  platformName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  connectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  disconnectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F44336',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  disconnectedText: {
    color: '#F44336',
  },
  lastSyncText: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  platformActions: {
    marginTop: 12,
  },
  syncStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  syncStatusLabel: {
    fontSize: 14,
    color: '#333',
  },
  refreshingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  refreshingText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#666',
  },
  divider: {
    marginVertical: 24,
  },
  accountCard: {
    elevation: 1,
  },
});
