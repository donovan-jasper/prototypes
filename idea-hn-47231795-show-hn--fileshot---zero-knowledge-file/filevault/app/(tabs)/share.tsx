import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Text, Dialog, Portal } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useFileVault } from '@/hooks/useFileVault';
import { useSubscription } from '@/hooks/useSubscription';
import { useP2PTransfer } from '@/hooks/useP2PTransfer';
import ExpirationPicker from '@/components/ExpirationPicker';
import PremiumGate from '@/components/PremiumGate';
import PeerList from '@/components/PeerList';
import TransferProgress from '@/components/TransferProgress';
import { Colors } from '@/constants/Colors';

export default function ShareScreen() {
  const [file, setFile] = useState(null);
  const [expiration, setExpiration] = useState(24);
  const [showPeerList, setShowPeerList] = useState(false);
  const [selectedPeer, setSelectedPeer] = useState(null);
  const { shareFile, addNewFile } = useFileVault();
  const { canShare, showPremiumGate, incrementShareCount } = useSubscription();
  const { isTransferring, progress, sendFileP2P, discoverPeers } = useP2PTransfer();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const fileData = await fetch(asset.uri);
      const blob = await fileData.blob();
      const reader = new FileReader();
      reader.onload = async () => {
        await addNewFile(asset.fileName || 'image.jpg', reader.result);
        setFile({ id: Date.now().toString(), name: asset.fileName || 'image.jpg' });
      };
      reader.readAsDataURL(blob);
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
    });

    if (result.type === 'success') {
      const fileData = await fetch(result.uri);
      const blob = await fileData.blob();
      const reader = new FileReader();
      reader.onload = async () => {
        await addNewFile(result.name, reader.result);
        setFile({ id: Date.now().toString(), name: result.name });
      };
      reader.readAsDataURL(blob);
    }
  };

  const handleShare = async () => {
    if (!canShare()) {
      showPremiumGate();
      return;
    }

    if (!file) {
      Alert.alert('No file selected', 'Please select a file to share');
      return;
    }

    try {
      const link = await shareFile(file, expiration);
      Alert.alert('Share Link', `Share this link: ${link}`);
      incrementShareCount();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleP2PShare = async () => {
    if (!file) {
      Alert.alert('No file selected', 'Please select a file to share');
      return;
    }

    try {
      await discoverPeers();
      setShowPeerList(true);
    } catch (error) {
      Alert.alert('Error', 'Could not discover devices on your network');
    }
  };

  const handlePeerSelect = async (peerId) => {
    setSelectedPeer(peerId);
    setShowPeerList(false);

    if (file) {
      try {
        await sendFileP2P(file.id, peerId);
        incrementShareCount();
      } catch (error) {
        Alert.alert('Transfer Failed', error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Share a file</Text>
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={pickImage}
          style={styles.button}
          icon="camera"
        >
          Camera
        </Button>
        <Button
          mode="contained"
          onPress={pickDocument}
          style={styles.button}
          icon="file"
        >
          Documents
        </Button>
      </View>
      {file && (
        <>
          <Text style={styles.fileInfo}>
            Selected: {file.name}
          </Text>
          <ExpirationPicker
            value={expiration}
            onChange={setExpiration}
          />
          <Button
            mode="contained"
            onPress={handleShare}
            style={styles.shareButton}
            icon="share"
          >
            Generate Share Link
          </Button>
          <Button
            mode="outlined"
            onPress={handleP2PShare}
            style={styles.p2pButton}
            icon="lan"
          >
            Send via P2P
          </Button>
        </>
      )}
      <PremiumGate />

      <Portal>
        <Dialog visible={showPeerList} onDismiss={() => setShowPeerList(false)}>
          <Dialog.Title>Select Device</Dialog.Title>
          <Dialog.Content>
            <PeerList onSelectPeer={handlePeerSelect} />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowPeerList(false)}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {isTransferring && (
        <TransferProgress
          progress={progress}
          isSending={true}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.light.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors.light.text,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
  fileInfo: {
    marginBottom: 20,
    color: Colors.light.text,
  },
  shareButton: {
    marginTop: 20,
  },
  p2pButton: {
    marginTop: 10,
  },
});
