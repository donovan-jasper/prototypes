import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { getOfflineChannels, syncChannels } from '../services/discordApi';
import { getStoredToken } from '../services/auth';

const ChannelsScreen = ({ route, navigation }) => {
  const { serverId } = route.params;
  const [channels, setChannels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadChannels = async () => {
    try {
      const offlineChannels = await getOfflineChannels(serverId);
      if (offlineChannels.length > 0) {
        setChannels(offlineChannels);
      } else {
        // If no offline data, try to sync with Discord
        const token = await getStoredToken();
        if (token) {
          const syncedChannels = await syncChannels(serverId);
          setChannels(syncedChannels);
        } else {
          // No token, redirect to login
          navigation.replace('Login');
        }
      }
    } catch (error) {
      console.error('Error loading channels:', error);
      Alert.alert('Error', 'Failed to load channels. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const syncedChannels = await syncChannels(serverId);
      setChannels(syncedChannels);
    } catch (error) {
      console.error('Error refreshing channels:', error);
      Alert.alert('Error', 'Failed to refresh channels. Please check your connection.');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadChannels();
  }, []);

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
          <Text style={styles.header}>Channels</Text>
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
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    padding: 15,
    backgroundColor: '#2F3136',
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
