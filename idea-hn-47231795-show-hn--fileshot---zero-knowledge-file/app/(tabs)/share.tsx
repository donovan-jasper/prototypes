import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useFileVault } from '@/hooks/useFileVault';
import { useP2PTransfer } from '@/hooks/useP2PTransfer';
import { P2PTransferModal } from '@/components/P2PTransferModal';
import { Colors } from '@/constants/Colors';

interface FileInfo {
  uri: string;
  name: string;
  size: number;
  mimeType: string;
  id?: string;
}

export default function ShareScreen() {
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);
  const [isTransferModalVisible, setIsTransferModalVisible] = useState(false);
  const [selectedPeer, setSelectedPeer] = useState<string | null>(null);
  const [availablePeers, setAvailablePeers] = useState<string[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const { addNewFile } = useFileVault();
  const { discoverPeers } = useP2PTransfer();

  const pickDocument = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile({
          uri: file.uri,
          name: file.name,
          size: file.size,
          mimeType: file.mimeType,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  }, []);

  const takePhoto = useCallback(async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setSelectedFile({
          uri: result.assets[0].uri,
          name: `photo_${Date.now()}.jpg`,
          size: result.assets[0].fileSize,
          mimeType: 'image/jpeg',
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  }, []);

  const pickImage = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setSelectedFile({
          uri: result.assets[0].uri,
          name: result.assets[0].fileName || `file_${Date.now()}`,
          size: result.assets[0].fileSize,
          mimeType: result.assets[0].mimeType,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  }, []);

  const findPeers = useCallback(async () => {
    if (!selectedFile) {
      Alert.alert('Error', 'Please select a file first');
      return;
    }

    setIsDiscovering(true);
    try {
      const peers = await discoverPeers();
      setAvailablePeers(peers);

      if (peers.length === 0) {
        Alert.alert('No Devices Found', 'No devices found on the same network. The file will be available for sharing via link.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to discover devices');
    } finally {
      setIsDiscovering(false);
    }
  }, [selectedFile, discoverPeers]);

  const handleShare = useCallback(async () => {
    if (!selectedFile) {
      Alert.alert('Error', 'Please select a file first');
      return;
    }

    if (!selectedPeer) {
      Alert.alert('Error', 'Please select a device to share with');
      return;
    }

    try {
      // First save the file to our vault
      const fileId = await addNewFile(selectedFile.name, selectedFile.uri);

      // Update the selected file with the ID
      setSelectedFile(prev => prev ? { ...prev, id: fileId } : null);

      // Show the transfer modal
      setIsTransferModalVisible(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to prepare file for sharing');
    }
  }, [selectedFile, selectedPeer, addNewFile]);

  const renderPeerItem = useCallback(({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.peerItem,
        selectedPeer === item && styles.selectedPeerItem
      ]}
      onPress={() => setSelectedPeer(item)}
    >
      <Text style={styles.peerText}>{item}</Text>
    </TouchableOpacity>
  ), [selectedPeer]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Share a File</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={takePhoto}>
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>Pick Image</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={pickDocument}>
          <Text style={styles.buttonText}>Pick Document</Text>
        </TouchableOpacity>
      </View>

      {selectedFile && (
        <View style={styles.fileInfo}>
          <Text style={styles.fileName}>{selectedFile.name}</Text>
          <Text style={styles.fileSize}>
            {Math.round(selectedFile.size / 1024)} KB
          </Text>
        </View>
      )}

      {selectedFile && (
        <TouchableOpacity
          style={styles.discoverButton}
          onPress={findPeers}
          disabled={isDiscovering}
        >
          <Text style={styles.discoverButtonText}>
            {isDiscovering ? 'Searching...' : 'Find Devices'}
          </Text>
        </TouchableOpacity>
      )}

      {availablePeers.length > 0 && (
        <View style={styles.peersContainer}>
          <Text style={styles.peersTitle}>Available Devices:</Text>
          <FlatList
            data={availablePeers}
            renderItem={renderPeerItem}
            keyExtractor={(item) => item}
            style={styles.peersList}
          />
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.shareButton,
          (!selectedFile || !selectedPeer) && styles.disabledButton
        ]}
        onPress={handleShare}
        disabled={!selectedFile || !selectedPeer}
      >
        <Text style={styles.shareButtonText}>Share via P2P</Text>
      </TouchableOpacity>

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
    padding: 20,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: Colors.text,
    textAlign: 'center',
  },
  buttonContainer: {
    marginBottom: 30,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  fileInfo: {
    backgroundColor: Colors.card,
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
  fileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 5,
  },
  fileSize: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  discoverButton: {
    backgroundColor: Colors.secondary,
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
    alignItems: 'center',
  },
  discoverButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  peersContainer: {
    marginBottom: 20,
  },
  peersTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 10,
  },
  peersList: {
    maxHeight: 150,
  },
  peerItem: {
    padding: 10,
    backgroundColor: Colors.card,
    borderRadius: 5,
    marginBottom: 5,
  },
  selectedPeerItem: {
    backgroundColor: Colors.primary,
  },
  peerText: {
    color: Colors.text,
  },
  shareButton: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: Colors.disabled,
  },
  shareButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
