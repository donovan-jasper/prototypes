import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { getOfflineServers, syncServers, getLastSyncTime } from '../services/discordApi';
import { getStoredToken, logout } from '../services/auth';
import { useFocusEffect } from '@react-navigation/native';

const MainScreen = ({ navigation }) => {
  const [servers, setServers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  const loadServers = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);

    try {
      // Get last sync time
      const syncTime = await getLastSyncTime('last_server_sync');
      setLastSyncTime(syncTime);

      // Try to get offline data first
      const offlineServers = await getOfflineServers();
      if (offlineServers.length > 0) {
        setServers(offlineServers);
      }

      // Try to sync with Discord if we have a token
      const token = await getStoredToken();
      if (token) {
        const syncedServers = await syncServers();
        setServers(syncedServers);
        setLastSyncTime(new Date());
      } else {
        // No token, redirect to login
        navigation.replace('Login');
      }
    } catch (error) {
      console.error('Error loading servers:', error);
      if (error.message.includes('No authentication token')) {
        // Show offline data if available
        const offlineServers = await getOfflineServers();
        if (offlineServers.length > 0) {
          setServers(offlineServers);
          Alert.alert('Offline Mode', 'You are viewing cached servers. Connect to the internet to sync with Discord.');
        } else {
          Alert.alert('Error', 'No servers available offline. Please connect to the internet.');
          navigation.replace('Login');
        }
      } else {
        Alert.alert('Error', 'Failed to load servers. Please try again.');
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [navigation]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadServers(false);
  }, [loadServers]);

  const handleLogout = async () => {
    try {
      await logout();
      navigation.replace('Login');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadServers();
    }, [loadServers])
  );

  const renderServerItem = ({ item }) => (
    <TouchableOpacity
      style={styles.serverItem}
      onPress={() => navigation.navigate('Channels', { serverId: item.id })}
    >
      <View style={styles.serverIcon}>
        <Text style={styles.serverIconText}>{item.name.charAt(0)}</Text>
      </View>
      <Text style={styles.serverName}>{item.name}</Text>
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
        data={servers}
        renderItem={renderServerItem}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <Text style={styles.header}>Your Servers</Text>
            {lastSyncTime && (
              <Text style={styles.syncStatus}>
                Last synced: {lastSyncTime.toLocaleString()}
              </Text>
            )}
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
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
    marginBottom: 10,
  },
  logoutButton: {
    padding: 8,
    backgroundColor: '#2F3136',
    borderRadius: 4,
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  logoutText: {
    color: '#ED4245',
    fontSize: 14,
  },
  serverItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2F3136',
  },
  serverIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#5865F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  serverIconText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  serverName: {
    color: '#fff',
    fontSize: 16,
  },
});

export default MainScreen;
