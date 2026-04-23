import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useP2PTransfer } from '@/hooks/useP2PTransfer';
import { Colors } from '@/constants/Colors';

const PeerList = ({ onSelectPeer }) => {
  const [isDiscovering, setIsDiscovering] = useState(false);
  const { peers, discoverPeers } = useP2PTransfer();

  useEffect(() => {
    const discover = async () => {
      setIsDiscovering(true);
      await discoverPeers();
      setIsDiscovering(false);
    };
    discover();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.peerItem}
      onPress={() => onSelectPeer(item)}
    >
      <Text style={styles.peerName}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {isDiscovering ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator animating={true} color={Colors.light.primary} />
          <Text style={styles.loadingText}>Searching for devices...</Text>
        </View>
      ) : peers.length > 0 ? (
        <FlatList
          data={peers}
          renderItem={renderItem}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No devices found on your network</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: Colors.light.text,
  },
  listContainer: {
    padding: 16,
  },
  peerItem: {
    padding: 16,
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    marginBottom: 8,
  },
  peerName: {
    fontSize: 16,
    color: Colors.light.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: Colors.light.text,
    textAlign: 'center',
  },
});

export default PeerList;
