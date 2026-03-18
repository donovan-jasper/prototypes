import React, { useState } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { Text, Card, Button, Switch, Snackbar, Divider } from 'react-native-paper';
import { useAppStore } from '../../store/app-store';
import { Platform } from '../../types';
import * as SecureStore from 'expo-secure-store';

const platformInfo: Record<Platform, { label: string; color: string }> = {
  ebay: { label: 'eBay', color: '#E53238' },
  etsy: { label: 'Etsy', color: '#F1641E' },
  depop: { label: 'Depop', color: '#FF0000' },
  poshmark: { label: 'Poshmark', color: '#630F3E' },
  facebook: { label: 'Facebook Marketplace', color: '#1877F2' },
};

export default function SettingsScreen() {
  const { platforms, togglePlatform } = useAppStore();
  const [autoSync, setAutoSync] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);

  const connectedPlatforms = platforms.filter(p => p.enabled).length;
  const isFreeTier = true;
  const maxPlatforms = isFreeTier ? 2 : Infinity;
  const maxListings = isFreeTier ? 25 : Infinity;

  const handleConnect = async (platformId: string, platformName: Platform) => {
    setConnectingPlatform(platformId);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockToken = `mock_${platformName}_token_${Date.now()}`;
    await SecureStore.setItemAsync(`${platformName}_api_token`, mockToken);
    
    togglePlatform(platformId);
    setConnectingPlatform(null);
    setSnackbarMessage(`${platformInfo[platformName].label} connected successfully`);
    setSnackbarVisible(true);
  };

  const handleDisconnect = async (platformId: string, platformName: Platform) => {
    await SecureStore.deleteItemAsync(`${platformName}_api_token`);
    togglePlatform(platformId);
    setSnackbarMessage(`${platformInfo[platformName].label} disconnected`);
    setSnackbarVisible(true);
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
          const isConnecting = connectingPlatform === platform.id;
          
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
                          <Text style={[styles.statusText, styles.disconnectedText]}>
                            Disconnected
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <Button
                    mode={platform.enabled ? 'outlined' : 'contained'}
                    onPress={() => {
                      if (platform.enabled) {
                        handleDisconnect(platform.id, platform.name);
                      } else {
                        if (!canConnectMore) {
                          setSnackbarMessage('Upgrade to Pro to connect more platforms');
                          setSnackbarVisible(true);
                          return;
                        }
                        handleConnect(platform.id, platform.name);
                      }
                    }}
                    loading={isConnecting}
                    disabled={isConnecting || (!platform.enabled && !canConnectMore)}
                    style={styles.connectButton}
                  >
                    {platform.enabled ? 'Disconnect' : 'Connect'}
                  </Button>
                </View>
              </Card.Content>
            </Card>
          );
        })}

        <Divider style={styles.divider} />

        <Card style={styles.syncCard}>
          <Card.Content>
            <View style={styles.syncRow}>
              <View style={styles.syncInfo}>
                <Text style={styles.syncTitle}>Auto-Sync</Text>
                <Text style={styles.syncDescription}>
                  {autoSync ? 'Syncs every 15 minutes' : 'Manual sync only'}
                </Text>
              </View>
              <Switch
                value={autoSync}
                onValueChange={(value) => {
                  if (value && isFreeTier) {
                    setSnackbarMessage('Auto-sync requires Pro subscription');
                    setSnackbarVisible(true);
                    return;
                  }
                  setAutoSync(value);
                  setSnackbarMessage(value ? 'Auto-sync enabled' : 'Auto-sync disabled');
                  setSnackbarVisible(true);
                }}
              />
            </View>
          </Card.Content>
        </Card>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  subscriptionCard: {
    margin: 16,
    marginBottom: 8,
  },
  tierTitle: {
    fontSize: 20,
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
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  platformCard: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
  platformHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  platformInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  platformIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  platformDetails: {
    flex: 1,
  },
  platformName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
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
    backgroundColor: '#9E9E9E',
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '500',
  },
  disconnectedText: {
    color: '#9E9E9E',
  },
  lastSyncText: {
    fontSize: 12,
    color: '#999',
  },
  connectButton: {
    marginLeft: 8,
  },
  divider: {
    marginVertical: 16,
  },
  syncCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  syncRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  syncInfo: {
    flex: 1,
  },
  syncTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  syncDescription: {
    fontSize: 14,
    color: '#666',
  },
  bottomPadding: {
    height: 24,
  },
});
