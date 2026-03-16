import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSyncStatus } from '../lib/store';

export default function SyncIndicator() {
  const syncStatus = useSyncStatus();

  return (
    <View style={styles.container}>
      <Text style={styles.statusText}>Sync Status: {syncStatus}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
