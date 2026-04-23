import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { useAppStore } from '../store/app-store';

const SyncStatusIndicator = () => {
  const { syncStatus, isOnline, triggerSync } = useAppStore();

  const getStatusColor = () => {
    switch (syncStatus) {
      case 'syncing':
        return '#FFC107'; // Yellow
      case 'synced':
        return '#4CAF50'; // Green
      case 'error':
        return '#F44336'; // Red
      case 'pending':
        return '#9E9E9E'; // Gray
      default:
        return '#9E9E9E'; // Gray
    }
  };

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'sync';
      case 'synced':
        return 'check-circle';
      case 'error':
        return 'alert-circle';
      case 'pending':
        return 'cloud-off-outline';
      default:
        return 'cloud-outline';
    }
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    switch (syncStatus) {
      case 'syncing':
        return 'Syncing...';
      case 'synced':
        return 'Synced';
      case 'error':
        return 'Sync Error';
      case 'pending':
        return 'Pending Sync';
      default:
        return 'Idle';
    }
  };

  const getButtonText = () => {
    if (syncStatus === 'syncing') return 'Syncing...';
    return isOnline ? 'Sync Now' : 'Sync When Online';
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusContainer}>
        <IconButton
          icon={getStatusIcon()}
          color={getStatusColor()}
          size={20}
          style={styles.icon}
        />
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
      </View>
      <IconButton
        icon="refresh"
        size={20}
        onPress={triggerSync}
        disabled={syncStatus === 'syncing'}
        style={styles.syncButton}
      >
        {getButtonText()}
      </IconButton>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  syncButton: {
    marginLeft: 'auto',
  },
});

export default SyncStatusIndicator;
