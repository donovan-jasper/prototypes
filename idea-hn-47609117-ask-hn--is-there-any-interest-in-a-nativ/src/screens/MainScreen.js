import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { getOfflineServers, syncServers } from '../services/discordApi';
import { authenticateWithDiscord } from '../services/auth';

const MainScreen = ({ navigation }) => {
  const [servers, setServers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadServers = async () => {
    try {
      const offlineServers = await getOfflineServers();
      if (offlineServers.length > 0) {
        setServers(offlineServers);
      } else {
        // If no offline data, try to sync with Discord
        const token = await authenticateWithDiscord();
        const syncedServers = await syncServers(token);
        setServers(syncedServers);
      }
    } catch (error) {
      console.error('Error loading servers:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const token = await authenticateWithDiscord();
      const syncedServers = await syncServers(token);
      setServers(syncedServers);
    } catch (error) {
      console.error('Error refreshing servers:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadServers();
  }, []);

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
          <Text style={styles.header}>Your Servers</Text>
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
