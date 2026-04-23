import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { uploadSyncData, downloadSyncData, getSyncStatus } from '../lib/sync';
import { useUserStore } from '../store/user';

const CloudSyncButton = () => {
  const { isPremium } = useUserStore();
  const [syncStatus, setSyncStatus] = useState<{ isSynced: boolean; lastSync: number | null }>({
    isSynced: false,
    lastSync: null,
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSyncStatus = async () => {
      const status = await getSyncStatus();
      setSyncStatus(status);
    };

    loadSyncStatus();
  }, []);

  const handleSync = async (direction: 'upload' | 'download') => {
    if (!isPremium) {
      setError('Cloud sync requires premium membership');
      return;
    }

    setIsSyncing(true);
    setError(null);

    try {
      let result;
      if (direction === 'upload') {
        result = await uploadSyncData();
      } else {
        result = await downloadSyncData();
      }

      if (result.success) {
        const status = await getSyncStatus();
        setSyncStatus(status);
      } else {
        setError(result.error || 'Sync failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSyncing(false);
    }
  };

  const formatLastSync = () => {
    if (!syncStatus.lastSync) return 'Never synced';

    const date = new Date(syncStatus.lastSync);
    return `Last sync: ${date.toLocaleString()}`;
  };

  if (!isPremium) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          {syncStatus.isSynced ? '✓ Synced' : '⚠ Not synced'}
        </Text>
        <Text style={styles.lastSyncText}>{formatLastSync()}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.uploadButton]}
          onPress={() => handleSync('upload')}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Upload</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.downloadButton]}
          onPress={() => handleSync('download')}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Download</Text>
          )}
        </TouchableOpacity>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    margin: 16,
  },
  statusContainer: {
    marginBottom: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  lastSyncText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  uploadButton: {
    backgroundColor: '#4CAF50',
  },
  downloadButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#F44336',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default CloudSyncButton;
