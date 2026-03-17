import React, { useEffect, useContext, useState } from 'react';
import { View, FlatList, StyleSheet, Text, RefreshControl } from 'react-native';
import { useConnections } from '../../hooks/useConnections';
import ConnectionCard from '../../components/ConnectionCard';
import { AuthContext } from '../../contexts/AuthContext';

const ConnectionsScreen = () => {
  const { user } = useContext(AuthContext);
  const { connections, loading, error, fetchConnections } = useConnections();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchConnections(user.id);
    }
  }, [user]);

  const onRefresh = async () => {
    if (user) {
      setRefreshing(true);
      await fetchConnections(user.id);
      setRefreshing(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text>Error: {error.message}</Text>
      </View>
    );
  }

  if (connections.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No connections yet</Text>
        <Text style={styles.emptySubtext}>Start connecting with people to see them here</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={connections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ConnectionCard connection={item} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default ConnectionsScreen;
