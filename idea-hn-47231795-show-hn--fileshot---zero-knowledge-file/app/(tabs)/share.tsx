import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useFileVault } from '@/hooks/useFileVault';
import { useP2PTransfer } from '@/hooks/useP2PTransfer';
import { P2PTransferModal } from '@/components/P2PTransferModal';
import { Colors } from '@/constants/Colors';

export default function ShareScreen() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isTransferModalVisible, setIsTransferModalVisible] = useState(false);
  const [selectedPeer, setSelectedPeer] = useState(null);
  const { addNewFile } = useFileVault();
  const { discoverPeers, peers } = useP2PTransfer();

  const pickDocument = async () => {
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
  };

  const takePhoto = async () => {
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
  };

  const pickImage = async () => {
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
  };

  const handleShare = async () => {
    if (!selectedFile) {
      Alert.alert('Error', 'Please select a file first');
      return;
    }

    try {
      // First save the file to our vault
      const fileId = await addNewFile(selectedFile.name, selectedFile.uri);

      // Then find available peers
      const availablePeers = await discoverPeers();

      if (availablePeers.length === 0) {
        Alert.alert('No Peers Found', 'No devices found on the same network');
        return;
      }

      // For simplicity, just use the first peer found
      setSelectedPeer(availablePeers[0]);
      setIsTransferModalVisible(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to prepare file for sharing');
    }
  };

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

      <TouchableOpacity
        style={[styles.shareButton, !selectedFile && styles.disabledButton]}
        onPress={handleShare}
        disabled={!selectedFile}
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
