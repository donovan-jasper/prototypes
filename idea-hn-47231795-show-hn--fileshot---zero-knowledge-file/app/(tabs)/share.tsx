import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useFileVault } from '@/hooks/useFileVault';
import { useP2PTransfer } from '@/hooks/useP2PTransfer';
import { Colors } from '@/constants/Colors';
import { P2PTransferModal } from '@/components/P2PTransferModal';
import { PeerDiscoveryModal } from '@/components/PeerDiscoveryModal';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

export default function ShareScreen() {
  const [selectedFile, setSelectedFile] = useState<{ id: string; name: string } | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showPeerDiscovery, setShowPeerDiscovery] = useState(false);
  const [selectedPeer, setSelectedPeer] = useState<string | null>(null);
  const { addNewFile } = useFileVault();
  const { sendFileP2P } = useP2PTransfer();

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        const fileId = Date.now().toString();
        await addNewFile({
          id: fileId,
          name: result.name,
          size: result.size,
          path: result.uri,
          encrypted: false
        });
        setSelectedFile({ id: fileId, name: result.name });
      }
    } catch (error) {
      console.error('Document picker error:', error);
      Alert.alert('Error', 'Could not select document');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileId = Date.now().toString();
        await addNewFile({
          id: fileId,
          name: asset.fileName || 'image.jpg',
          size: asset.fileSize || 0,
          path: asset.uri,
          encrypted: false
        });
        setSelectedFile({ id: fileId, name: asset.fileName || 'image.jpg' });
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Could not select image');
    }
  };

  const handleSendP2P = () => {
    if (!selectedFile) {
      Alert.alert('Error', 'Please select a file first');
      return;
    }
    setShowPeerDiscovery(true);
  };

  const handlePeerSelected = (peerId: string) => {
    setSelectedPeer(peerId);
    setShowPeerDiscovery(false);
    setShowTransferModal(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Share Files Securely</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={pickDocument}>
          <Text style={styles.buttonText}>Select Document</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>Select Image</Text>
        </TouchableOpacity>
      </View>

      {selectedFile && (
        <View style={styles.selectedFileContainer}>
          <Text style={styles.selectedFileText}>Selected: {selectedFile.name}</Text>
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendP2P}
          >
            <Text style={styles.sendButtonText}>Send via P2P</Text>
          </TouchableOpacity>
        </View>
      )}

      <PeerDiscoveryModal
        visible={showPeerDiscovery}
        onClose={() => setShowPeerDiscovery(false)}
        onSelectPeer={handlePeerSelected}
      />

      <P2PTransferModal
        visible={showTransferModal}
        onClose={() => setShowTransferModal(false)}
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
    marginBottom: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  selectedFileContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: Colors.card,
    borderRadius: 5,
  },
  selectedFileText: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 10,
  },
  sendButton: {
    backgroundColor: Colors.success,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
