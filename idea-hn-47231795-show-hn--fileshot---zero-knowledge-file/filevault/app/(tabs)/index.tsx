import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { useFileVault } from '@/hooks/useFileVault';
import { useP2PTransfer } from '@/hooks/useP2PTransfer';
import FileCard from '@/components/FileCard';
import TransferProgress from '@/components/TransferProgress';
import { Colors } from '@/constants/Colors';

export default function VaultScreen() {
  const { files, refreshFiles } = useFileVault();
  const { isTransferring, progress, receiveFileP2P } = useP2PTransfer();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshFiles();
    setRefreshing(false);
  };

  // In a real app, you would listen for incoming P2P transfers
  // For this example, we'll simulate receiving a file
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isTransferring) {
        // Simulate receiving a file from a peer
        receiveFileP2P('device-1');
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [isTransferring]);

  return (
    <View style={styles.container}>
      <FlatList
        data={files}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FileCard file={item} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.light.tint]}
            tintColor={Colors.light.tint}
          />
        }
      />

      {isTransferring && (
        <TransferProgress
          progress={progress}
          isSending={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
});
