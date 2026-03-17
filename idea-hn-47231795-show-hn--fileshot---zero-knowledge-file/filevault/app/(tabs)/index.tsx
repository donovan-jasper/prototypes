import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, Alert } from 'react-native';
import { useFileVault } from '@/hooks/useFileVault';
import { useP2PTransfer } from '@/hooks/useP2PTransfer';
import FileCard from '@/components/FileCard';
import TransferProgress from '@/components/TransferProgress';
import { Colors } from '@/constants/Colors';

export default function VaultScreen() {
  const { files, refreshFiles, removeFile } = useFileVault();
  const { isTransferring, progress, receiveFileP2P, discoverPeers } = useP2PTransfer();
  const [refreshing, setRefreshing] = useState(false);
  const [incomingTransfer, setIncomingTransfer] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshFiles();
    setRefreshing(false);
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await removeFile(fileId);
      Alert.alert('Success', 'File deleted successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete file');
    }
  };

  // Simulate incoming P2P transfer
  useEffect(() => {
    const checkForTransfers = async () => {
      try {
        const peers = await discoverPeers();
        if (peers.length > 0 && !isTransferring) {
          setIncomingTransfer(true);
          // Simulate receiving a file after 3 seconds
          setTimeout(async () => {
            await receiveFileP2P(peers[0]);
            setIncomingTransfer(false);
          }, 3000);
        }
      } catch (error) {
        console.error('Discovery error:', error);
      }
    };

    const interval = setInterval(checkForTransfers, 5000);
    return () => clearInterval(interval);
  }, [isTransferring]);

  return (
    <View style={styles.container}>
      <FlatList
        data={files}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FileCard
            file={{
              ...item,
              expiresIn: Math.ceil((item.expiresAt - Date.now()) / (60 * 60 * 1000))
            }}
            onDelete={handleDeleteFile}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.light.tint]}
            tintColor={Colors.light.tint}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No files in your vault</Text>
            <Text style={styles.emptyHint}>Tap the Share tab to add files</Text>
          </View>
        }
      />

      {isTransferring && (
        <TransferProgress
          progress={progress}
          isSending={false}
        />
      )}

      {incomingTransfer && !isTransferring && (
        <View style={styles.notification}>
          <Text style={styles.notificationText}>Incoming file transfer...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 10,
    color: Colors.light.text,
  },
  emptyHint: {
    fontSize: 14,
    color: Colors.light.text,
  },
  notification: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.light.tint,
    padding: 15,
    alignItems: 'center',
  },
  notificationText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
