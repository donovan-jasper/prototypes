import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useFileVault } from '@/hooks/useFileVault';
import { useP2PTransfer } from '@/hooks/useP2PTransfer';
import { Colors } from '@/constants/Colors';
import { P2PTransferModal } from '@/components/P2PTransferModal';
import { ExpirationPicker } from '@/components/ExpirationPicker';
import { PremiumGate } from '@/components/PremiumGate';

export default function ShareScreen() {
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [expirationHours, setExpirationHours] = useState(24);
  const [peerId, setPeerId] = useState<string | null>(null);

  const { addNewFile, canShare } = useFileVault();
  const { discoverPeers } = useP2PTransfer();

  const pickDocument = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        setSelectedFile(result);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Could not select document');
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
          assets: [{
            name: 'photo.jpg',
            uri: result.assets[0].uri,
            size: result.assets[0].fileSize || 0,
            mimeType: 'image/jpeg',
          }],
          canceled: false,
        });
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Could not take photo');
    }
  }, []);

  const pickFromGallery = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setSelectedFile({
          assets: [{
            name: result.assets[0].fileName || 'image.jpg',
            uri: result.assets[0].uri,
            size: result.assets[0].fileSize || 0,
            mimeType: result.assets[0].mimeType || 'image/jpeg',
          }],
          canceled: false,
        });
      }
    } catch (error) {
      console.error('Error picking from gallery:', error);
      Alert.alert('Error', 'Could not select image');
    }
  }, []);

  const handleShare = useCallback(async () => {
    if (!selectedFile || selectedFile.canceled) {
      Alert.alert('Error', 'Please select a file first');
      return;
    }

    if (!canShare()) {
      Alert.alert('Limit Reached', 'You\'ve reached your free share limit. Upgrade to share more files.');
      return;
    }

    try {
      setIsLoading(true);

      // Add file to vault
      const fileId = await addNewFile({
        name: selectedFile.assets[0].name,
        size: selectedFile.assets[0].size,
        path: selectedFile.assets[0].uri,
        encrypted: false, // In real app, this would be true after encryption
      });

      // Discover peers
      const peers = await discoverPeers();
      if (peers.length === 0) {
        Alert.alert('No Devices Found', 'No other devices found on your network');
        return;
      }

      // For demo, just use the first peer
      setPeerId(peers[0]);
      setShowTransferModal(true);
    } catch (error) {
      console.error('Error sharing file:', error);
      Alert.alert('Error', 'Could not share file');
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile, addNewFile, discoverPeers, canShare]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Share a File</Text>

      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.optionButton} onPress={takePhoto}>
          <Text style={styles.optionText}>Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionButton} onPress={pickFromGallery}>
          <Text style={styles.optionText}>Choose from Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionButton} onPress={pickDocument}>
          <Text style={styles.optionText}>Select Document</Text>
        </TouchableOpacity>
      </View>

      {selectedFile && !selectedFile.canceled && (
        <View style={styles.fileInfo}>
          <Text style={styles.fileName}>{selectedFile.assets[0].name}</Text>
          <Text style={styles.fileSize}>
            {Math.round(selectedFile.assets[0].size / 1024)} KB
          </Text>
        </View>
      )}

      <ExpirationPicker
        value={expirationHours}
        onChange={setExpirationHours}
      />

      <TouchableOpacity
        style={[
          styles.shareButton,
          (!selectedFile || selectedFile.canceled) && styles.disabledButton
        ]}
        onPress={handleShare}
        disabled={!selectedFile || selectedFile.canceled || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.shareButtonText}>Share via P2P</Text>
        )}
      </TouchableOpacity>

      <P2PTransferModal
        visible={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        fileId={selectedFile?.assets[0].uri} // In real app, this would be the file ID from database
        peerId={peerId}
        isSender={true}
      />

      <PremiumGate />
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
  optionsContainer: {
    marginBottom: 30,
  },
  optionButton: {
    backgroundColor: Colors.card,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  optionText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  fileInfo: {
    backgroundColor: Colors.card,
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  fileName: {
    color: Colors.text,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  fileSize: {
    color: Colors.textSecondary,
  },
  shareButton: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: Colors.disabled,
  },
  shareButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
