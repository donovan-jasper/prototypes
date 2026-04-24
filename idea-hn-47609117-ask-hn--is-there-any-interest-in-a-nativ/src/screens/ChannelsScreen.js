import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { getChannels, saveChannels, getLastSyncTime } from '../storage/channelStorage';
import { getStoredToken } from '../services/auth';
import { useFocusEffect } from '@react-navigation/native';

const ChannelsScreen = ({ route, navigation }) => {
  const { serverId } = route.params;
  const [channels, setChannels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [authError, setAuthError] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);

  const loadChannels = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setAuthError(false);

    try {
      // Get last sync time
      const syncTime = await getLastSyncTime(serverId);
      setLastSyncTime(syncTime);

      // Try to get offline data first
      const offlineChannels = await getChannels(serverId);
      if (offlineChannels.length > 0) {
        setChannels(offlineChannels);
      }

      // Try to sync with Discord if we have a token
      const token = await getStoredToken();
      if (token) {
        try {
          const response = await fetch(`https://discord.com/api/v9/guilds/${serverId}/channels`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const syncedChannels = await response.json();
            await saveChannels(serverId, syncedChannels);
            setChannels(syncedChannels);
            setLastSyncTime(new Date());
            setOfflineMode(false);
          } else if (offlineChannels.length === 0) {
            throw new Error('Failed to fetch channels and no offline data available');
          }
        } catch (syncError) {
          console.error('Sync failed, using offline data:', syncError);
          setOfflineMode(true);
        }
      } else {
        setAuthError(true);
        if (offlineChannels.length === 0) {
          throw new Error('No authentication token and no offline data available');
        }
      }
    } catch (error) {
      console.error('Error loading channels:', error);
      if (error.message.includes('No authentication token')) {
        setAuthError(true);
      } else {
        Alert.alert('Error', 'Failed to load channels. Please try again.');
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [serverId]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadChannels(false);
  }, [loadChannels]);

  const handleTryAgain = useCallback(async () => {
    setIsLoading(true);
    await loadChannels();
  }, [loadChannels]);

  useFocusEffect(
    useCallback(() => {
      loadChannels();
    }, [loadChannels])
  );

  const renderChannelItem = ({ item }) => (
    <TouchableOpacity
      style={styles.channelItem}
      onPress={() => navigation.navigate('Messages', { channelId: item.id })}
    >
      <Text style={styles.channelName}># {item.name}</Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5865F2" />
      </View>
    );
  }

  if (authError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Authentication Required</Text>
        <Text style={styles.errorMessage}>
          You need to be logged in to access channels. Please log in to continue.
        </Text>
        <TouchableOpacity
          style={styles.tryAgainButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.tryAgainButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (channels.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Channels Available</Text>
        <Text style={styles.emptyMessage}>
          There are no channels in this server. Try refreshing or check your connection.
        </Text>
        <TouchableOpacity
          style={styles.tryAgainButton}
          onPress={handleTryAgain}
        >
          <Text style={styles.tryAgainButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={channels}
        renderItem={renderChannelItem}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <Text style={styles.header}>Channels</Text>
            {lastSyncTime && (
              <Text style={styles.syncStatus}>
                Last synced: {lastSyncTime.toLocaleString()}
              </Text>
            )}
            {offlineMode && (
              <Text style={styles.offlineStatus}>
                Offline mode: Showing cached data
              </Text>
            )}
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#36393F',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#36393F',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#36393F',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#36393F',
  },
  headerContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2F3136',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  syncStatus: {
    fontSize: 14,
    color: '#B9BBBE',
    marginBottom: 4,
  },
  offlineStatus: {
    fontSize: 14,
    color: '#F04747',
    marginBottom: 4,
  },
  channelItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2F3136',
  },
  channelName: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 16,
    color: '#B9BBBE',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#B9BBBE',
    textAlign: 'center',
    marginBottom: 24,
  },
  tryAgainButton: {
    backgroundColor: '#5865F2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
  },
  tryAgainButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChannelsScreen;
