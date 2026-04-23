import React, { useContext, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { ConnectionContext } from '../../contexts/ConnectionContext';
import ConnectionCard from '../../components/ConnectionCard';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const ConnectionsScreen = () => {
  const { connections, loading, refreshConnections } = useContext(ConnectionContext);
  const router = useRouter();

  useEffect(() => {
    refreshConnections();
  }, []);

  const handleConnectionPress = (connectionId: string) => {
    router.push(`/chat/${connectionId}`);
  };

  const handleStartCall = (connectionId: string) => {
    router.push(`/call/${connectionId}`);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading connections...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={connections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ConnectionCard
            connection={item}
            onPress={() => handleConnectionPress(item.id)}
            onStartCall={() => handleStartCall(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refreshConnections}
            tintColor="#007AFF"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No connections yet</Text>
            <Text style={styles.emptySubtext}>Find matches to start conversations</Text>
            <TouchableOpacity
              style={styles.findMatchesButton}
              onPress={() => router.push('/(tabs)/')}
            >
              <Ionicons name="search" size={20} color="#fff" />
              <Text style={styles.findMatchesText}>Find Matches</Text>
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
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
  },
  findMatchesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  findMatchesText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default ConnectionsScreen;
