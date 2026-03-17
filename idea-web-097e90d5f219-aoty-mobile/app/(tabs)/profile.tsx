import { StyleSheet, View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { syncNewReleases } from '@/services/sync';
import { getScheduledNotifications, cancelAllNotifications } from '@/services/notifications';

export default function ProfileScreen() {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    loadNotificationCount();
  }, []);

  const loadNotificationCount = async () => {
    const notifications = await getScheduledNotifications();
    setNotificationCount(notifications.length);
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await syncNewReleases();
      setLastSync(new Date());
      await loadNotificationCount();
      
      if (result.newAlbums.length > 0) {
        Alert.alert(
          'Sync Complete',
          `Found ${result.newAlbums.length} new album${result.newAlbums.length === 1 ? '' : 's'}!`
        );
      } else {
        Alert.alert('Sync Complete', 'No new releases found');
      }

      if (result.errors.length > 0) {
        console.error('Sync errors:', result.errors);
      }
    } catch (error) {
      Alert.alert('Sync Failed', 'Could not check for new releases');
    } finally {
      setSyncing(false);
    }
  };

  const handleClearNotifications = async () => {
    Alert.alert(
      'Clear Notifications',
      'Are you sure you want to cancel all scheduled notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await cancelAllNotifications();
            await loadNotificationCount();
            Alert.alert('Cleared', 'All notifications have been cancelled');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Scheduled notifications</Text>
            <Text style={styles.value}>{notificationCount}</Text>
          </View>
          {lastSync && (
            <View style={styles.row}>
              <Text style={styles.label}>Last sync</Text>
              <Text style={styles.value}>{lastSync.toLocaleTimeString()}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.button, syncing && styles.buttonDisabled]}
          onPress={handleSync}
          disabled={syncing}>
          <Text style={styles.buttonText}>
            {syncing ? 'Syncing...' : 'Check for New Releases'}
          </Text>
        </TouchableOpacity>

        {notificationCount > 0 && (
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={handleClearNotifications}>
            <Text style={styles.buttonTextSecondary}>Clear All Notifications</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <Text style={styles.aboutText}>
            CritWave sends you push notifications when your followed artists release new albums.
          </Text>
          <Text style={styles.aboutText}>
            Notifications include the album's consensus score and link directly to the album details.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 16,
    color: '#999',
  },
  value: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#1DB954',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    backgroundColor: '#555',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#666',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: '#999',
    fontSize: 16,
    fontWeight: '600',
  },
  aboutText: {
    fontSize: 14,
    color: '#999',
    lineHeight: 20,
    marginBottom: 8,
  },
});
