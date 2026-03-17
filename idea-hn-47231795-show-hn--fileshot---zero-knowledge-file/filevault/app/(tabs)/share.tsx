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
  const { shareFile } = useFileVault();
  const { canShare, showPremiumGate } = useSubscription();
  const { isTransferring, progress, sendFileP2P } = useP2PTransfer();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setFile(result.assets[0]);
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
    });

    if (result.type === 'success') {
      setFile(result);
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

    setShowPeerList(true);
  };

  const handlePeerSelect = (peerId) => {
    setSelectedPeer(peerId);
    setShowPeerList(false);
    // In a real app, you would start the transfer here
    if (file) {
      sendFileP2P(file.id, peerId);
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
            Selected: {file.name || file.fileName || 'Unnamed file'}
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
            onPress={() => setShowPeerList(true)}
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
