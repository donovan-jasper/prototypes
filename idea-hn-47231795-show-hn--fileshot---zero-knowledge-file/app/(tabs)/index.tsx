import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useFileVault } from '@/hooks/useFileVault';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { FileCard } from '@/components/FileCard';
import { P2PTransferModal } from '@/components/P2PTransferModal';
import { useP2PTransfer } from '@/hooks/useP2PTransfer';

export default function VaultScreen() {
  const { files, refreshFiles, deleteFile } = useFileVault();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [isP2PModalVisible, setIsP2PModalVisible] = useState(false);
  const [isReceivingP2P, setIsReceivingP2P] = useState(false);
  const { discoverPeers } = useP2PTransfer();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshFiles();
    setRefreshing(false);
  }, [refreshFiles]);

  const handleDeleteFile = useCallback(async (fileId: string) => {
    try {
      await deleteFile(fileId);
      await refreshFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      Alert.alert('Error', 'Failed to delete file. Please try again.');
    }
  }, [deleteFile, refreshFiles]);

  const handleP2PReceive = async () => {
    try {
      // Discover peers
      const peers = await discoverPeers();

      if (peers.length === 0) {
        Alert.alert(
          'No Devices Found',
          'No other devices were found on your network. Make sure both devices are on the same WiFi.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Show P2P transfer modal for receiving
      setIsReceivingP2P(true);
      setIsP2PModalVisible(true);
    } catch (error) {
      console.error('Error preparing P2P receive:', error);
      Alert.alert('Error', 'Failed to prepare P2P receive. Please try again.');
    }
  };

  const renderFileItem = ({ item }: { item: any }) => (
    <FileCard
      file={item}
      onDelete={() => handleDeleteFile(item.id)}
      onShare={() => {}}
      onP2PTransfer={() => {
        setSelectedFile(item);
        setIsP2PModalVisible(true);
        setIsReceivingP2P(false);
      }}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="folder-open-outline" size={64} color={Colors.gray} />
      <Text style={styles.emptyStateText}>No files in your vault</Text>
      <Text style={styles.emptyStateSubtext}>
        Tap the "Share" tab to add files or use P2P transfer
      </Text>
      <TouchableOpacity
        style={styles.p2pButton}
        onPress={handleP2PReceive}
      >
        <Ionicons name="wifi-outline" size={20} color={Colors.white} />
        <Text style={styles.p2pButtonText}>Receive via P2P</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Vault</Text>
        <TouchableOpacity onPress={handleP2PReceive}>
          <Ionicons name="wifi-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {files.length > 0 ? (
        <FlatList
          data={files}
          renderItem={renderFileItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        />
      ) : (
        renderEmptyState()
      )}

      <P2PTransferModal
        visible={isP2PModalVisible}
        onClose={() => setIsP2PModalVisible(false)}
        fileId={selectedFile?.id}
        isSender={!isReceivingP2P}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
    marginBottom: 20,
  },
  p2pButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  p2pButtonText: {
    color: Colors.white,
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
});
