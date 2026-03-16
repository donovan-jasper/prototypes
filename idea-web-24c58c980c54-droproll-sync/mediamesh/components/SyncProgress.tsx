import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSyncStore } from '../store/syncStore';

const SyncProgress = () => {
  const { progress, total } = useSyncStore();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Syncing: {progress}/{total}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  text: {
    fontSize: 16,
  },
});

export default SyncProgress;
