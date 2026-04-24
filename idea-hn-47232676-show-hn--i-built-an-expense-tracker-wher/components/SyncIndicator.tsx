import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useStore } from '../lib/store';
import { Ionicons } from '@expo/vector-icons';

const SyncIndicator = () => {
  const { syncStatus } = useStore();

  const getStatusInfo = () => {
    switch (syncStatus) {
      case 'connected':
        return {
          icon: 'cloud-done',
          color: '#4CAF50',
          text: 'Synced',
        };
      case 'syncing':
        return {
          icon: 'sync',
          color: '#FF9800',
          text: 'Syncing...',
        };
      case 'offline':
        return {
          icon: 'cloud-offline',
          color: '#F44336',
          text: 'Offline',
        };
      default:
        return {
          icon: 'cloud',
          color: '#9E9E9E',
          text: 'Connecting...',
        };
    }
  };

  const { icon, color, text } = getStatusInfo();

  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={16} color={color} />
      <Text style={[styles.text, { color }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  text: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '500',
  },
});

export default SyncIndicator;
