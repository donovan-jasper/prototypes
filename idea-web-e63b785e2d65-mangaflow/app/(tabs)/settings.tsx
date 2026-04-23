import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { uploadSyncData, downloadSyncData, getLastSyncTime, initializeSyncDirectory } from '../../lib/sync';
import { useUserStore } from '../../store/user';
import SyncStatusIndicator from '../../components/SyncStatusIndicator';

export default function SettingsScreen() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [syncStatus, setSyncStatus] = useState<{ isSynced: boolean; lastSync: number | null } | null>(null);
  const isPremium = useUserStore(state => state.isPremium);
  const navigation = useNavigation();

  useEffect(() => {
    initializeSyncDirectory();
    loadSyncStatus();
  }, []);

  const loadSyncStatus = async () => {
    const time = await getLastSyncTime();
    setLastSyncTime(time);
    setSyncStatus({
      isSynced: time !== null,
      lastSync: time
    });
  };

  const handleSync = async (isUpload: boolean) => {
    if (!isPremium) {
      Alert.alert(
        'Premium Feature',
        'Cloud sync is available to premium users only.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsSyncing(true);
    try {
      const result = isUpload ? await uploadSyncData() : await downloadSyncData();

      if (result.success) {
        await loadSyncStatus();
        Alert.alert(
          'Success',
          isUpload ? 'Library synced to cloud' : 'Library updated from cloud'
        );
      } else {
        Alert.alert('Error', result.error || 'Sync failed');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsSyncing(false);
    }
  };

  const formatSyncTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Cloud Sync</Text>
          {isPremium && <SyncStatusIndicator />}
        </View>

        {lastSyncTime && (
          <Text style={styles.syncInfo}>
            Last sync: {formatSyncTime(lastSyncTime)}
          </Text>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, !isPremium && styles.disabledButton]}
            onPress={() => handleSync(true)}
            disabled={isSyncing || !isPremium}
          >
            {isSyncing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Upload to Cloud</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, !isPremium && styles.disabledButton]}
            onPress={() => handleSync(false)}
            disabled={isSyncing || !isPremium}
          >
            {isSyncing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Download from Cloud</Text>
            )}
          </TouchableOpacity>
        </View>

        {!isPremium && (
          <Text style={styles.premiumNote}>
            Cloud sync requires premium subscription
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('premium')}
        >
          <Text style={styles.buttonText}>
            {isPremium ? 'Manage Subscription' : 'Go Premium'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Library</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Clear Cache</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.dangerButton]}>
          <Text style={[styles.buttonText, styles.dangerText]}>Delete All Manga</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  syncInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  dangerText: {
    color: '#fff',
  },
  premiumNote: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },
});
