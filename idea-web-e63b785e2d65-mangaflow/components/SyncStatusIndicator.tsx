import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { getSyncStatus } from '../lib/sync';
import { useUserStore } from '../store/user';

interface SyncStatusIndicatorProps {
  style?: any;
}

const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({ style }) => {
  const [syncStatus, setSyncStatus] = useState<{ isSynced: boolean; lastSync: number | null } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const isPremium = useUserStore(state => state.isPremium);

  useEffect(() => {
    if (!isPremium) return;

    const checkStatus = async () => {
      const status = await getSyncStatus();
      setSyncStatus(status);
    };

    checkStatus();

    // Set up interval to check sync status periodically
    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [isPremium]);

  if (!isPremium) {
    return null;
  }

  if (isSyncing) {
    return (
      <View style={[styles.container, style]}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.text}>Syncing...</Text>
      </View>
    );
  }

  if (!syncStatus) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <View style={[
        styles.dot,
        syncStatus.isSynced ? styles.synced : styles.notSynced
      ]} />
      <Text style={styles.text}>
        {syncStatus.isSynced
          ? `Synced ${syncStatus.lastSync ? new Date(syncStatus.lastSync).toLocaleTimeString() : ''}`
          : 'Not synced'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  synced: {
    backgroundColor: '#34C759',
  },
  notSynced: {
    backgroundColor: '#FF3B30',
  },
  text: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default SyncStatusIndicator;
