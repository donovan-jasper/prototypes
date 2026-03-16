import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useStore } from '../store/useStore';

const SyncIndicator = () => {
  const { isOnline, syncQueue } = useStore();

  const getStatus = () => {
    if (!isOnline) return { color: 'red', text: 'Offline' };
    if (syncQueue.length > 0) return { color: 'yellow', text: 'Syncing' };
    return { color: 'green', text: 'Synced' };
  };

  const status = getStatus();

  return (
    <View style={[styles.indicator, { backgroundColor: status.color }]}>
      <Text style={styles.text}>{status.text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  indicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 10,
  },
});

export default SyncIndicator;
