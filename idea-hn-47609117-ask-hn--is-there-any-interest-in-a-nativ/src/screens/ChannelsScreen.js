import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { getOfflineChannels, syncChannels, getLastSyncTime } from '../services/discordApi';
import { getStoredToken } from '../services/auth';
import { useFocusEffect } from '@react-navigation/native';

const ChannelsScreen = ({ route, navigation }) => {
  const { serverId } = route.params;
  const [channels, setChannels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  const loadChannels = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);

    try {
      // Get last sync time
      const syncTime = await getLastSyncTime('last_channel_sync');
      setLastSyncTime(syncTime);

      // Try to get offline data first
      const offlineChannels = await getOfflineChannels(serverId);
      if (offlineChannels.length > 0) {
        setChannels(offlineChannels);
      }

      // Try to sync with Discord if we have a token
      const token = await getStoredToken();
      if (token) {
        const syncedChannels = await syncChannels(serverId);
        setChannels(syncedChannels);
        setLastSyncTime(new Date());
      }
    } catch (error) {
      console.error('Error loading channels:', error);
      if (error.message.includes('No authentication token')) {
        // Show offline data if available
        const offlineChannels = await getOfflineChannels(serverId);
        if (offlineChannels.length > 0) {
          setChannels(offlineChannels);
          Alert.alert('Offline Mode', 'You are viewing cached channels. Connect to the internet to sync with Discord.');
        } else {
          Alert.alert('Error', 'No channels available offline. Please connect to the internet.');
        }
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
  headerContainer: {
    padding: 15,
    backgroundColor: '#2F3136',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  syncStatus: {
    color: '#72767D',
    fontSize: 12,
    marginTop: 4,
  },
  channelItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2F3136',
  },
  channelName: {
    color: '#b9bbbe',
    fontSize: 16,
  },
});

export default ChannelsScreen;
