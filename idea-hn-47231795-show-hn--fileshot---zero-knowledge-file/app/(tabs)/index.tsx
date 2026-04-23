import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useFileVault } from '@/hooks/useFileVault';
import { useP2PTransfer } from '@/hooks/useP2PTransfer';
import { FileCard } from '@/components/FileCard';
import { P2PTransferModal } from '@/components/P2PTransferModal';
import { Colors } from '@/constants/Colors';

export default function VaultScreen() {
  const [files, setFiles] = useState([]);
  const [isTransferModalVisible, setIsTransferModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedPeer, setSelectedPeer] = useState(null);
  const { getFiles, deleteFile } = useFileVault();
  const { discoverPeers } = useP2PTransfer();

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const fileList = await getFiles();
      setFiles(fileList);
    } catch (error) {
      Alert.alert('Error', 'Failed to load files');
    }
  };

  const handleShare = async (file) => {
    try {
      // Find available peers
      const availablePeers = await discoverPeers();

      if (availablePeers.length === 0) {
        Alert.alert('No Peers Found', 'No devices found on the same network');
        return;
      }

      // For simplicity, just use the first peer found
      setSelectedPeer(availablePeers[0]);
      setSelectedFile(file);
      setIsTransferModalVisible(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to prepare file for sharing');
    }
  };

  const handleDelete = async (fileId) => {
    try {
      await deleteFile(fileId);
      await loadFiles();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete file');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Vault</Text>

      {files.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No files in your vault yet</Text>
          <Text style={styles.emptySubtext}>Tap the "Share" tab to add files</Text>
        </View>
      ) : (
        <FlatList
          data={files}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FileCard
              file={item}
              onShare={() => handleShare(item)}
              onDelete={() => handleDelete(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      <P2PTransferModal
        visible={isTransferModalVisible}
        onClose={() => setIsTransferModalVisible(false)}
        fileId={selectedFile?.id}
        peerId={selectedPeer}
        isSender={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 20,
    color: Colors.text,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: Colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
});
