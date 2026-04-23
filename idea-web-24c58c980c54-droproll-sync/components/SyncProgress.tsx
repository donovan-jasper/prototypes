import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useSyncStore } from '../store/syncStore';

const SyncProgress = () => {
  const { current, total, service, isSyncing } = useSyncStore();

  if (!isSyncing) return null;

  const progress = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <View style={styles.container}>
      <ActivityIndicator size="small" color="#007AFF" />
      <Text style={styles.text}>
        Syncing {service}: {current}/{total} ({progress}%)
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    margin: 10,
  },
  text: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
});

export default SyncProgress;
