import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useP2PTransfer } from '@/hooks/useP2PTransfer';
import { Colors } from '@/constants/Colors';

const PeerList = ({ onSelectPeer }) => {
  const { peers, discoverPeers, isTransferring } = useP2PTransfer();

  useEffect(() => {
    discoverPeers();
  }, []);

  if (isTransferring) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating={true} size="large" />
        <Text style={styles.loadingText}>Transferring...</Text>
      </View>
    );
  }

  if (peers.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No devices found on your network</Text>
        <Text style={styles.hintText}>Make sure both devices are on the same WiFi network</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Devices</Text>
      <FlatList
        data={peers}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.peerItem}
            onPress={() => onSelectPeer(item)}
          >
            <Text style={styles.peerName}>{item}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: Colors.light.text,
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
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
    color: Colors.light.text,
  },
  hintText: {
    fontSize: 14,
    color: Colors.light.text,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.light.text,
  },
});

export default PeerList;
