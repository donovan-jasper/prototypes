import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { getOfflineServers } from '../services/discordApi';

const ServerList = ({ onSelectServer }) => {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadServers = async () => {
      try {
        const offlineServers = await getOfflineServers();
        setServers(offlineServers);
      } catch (error) {
        console.error('Failed to load servers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadServers();
  }, []);

  const renderServer = ({ item }) => (
    <TouchableOpacity
      style={styles.serverItem}
      onPress={() => onSelectServer(item.id)}
    >
      <Text style={styles.serverName}>{item.name}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5865F2" />
      </View>
    );
  }

  return (
    <FlatList
      data={servers}
      renderItem={renderServer}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  serverItem: {
    backgroundColor: '#2F3136',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  serverName: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ServerList;
