import React, { useEffect, useState } from 'react';
import { View, Text, Modal, StyleSheet, ActivityIndicator, TouchableOpacity, ProgressBarAndroid, Platform, Alert } from 'react-native';
import { useP2PTransfer } from '@/hooks/useP2PTransfer';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface P2PTransferModalProps {
  visible: boolean;
  onClose: () => void;
  fileId?: string;
  peerId?: string;
  isSender: boolean;
}

export const P2PTransferModal: React.FC<P2PTransferModalProps> = ({
  visible,
  onClose,
  fileId,
  peerId,
  isSender
}) => {
  const {
    isTransferring,
    progress,
    connectionState,
    sendFileP2P,
    receiveFileP2P,
    cancelTransfer,
    discoverPeers
  } = useP2PTransfer();
  const [availablePeers, setAvailablePeers] = useState<string[]>([]);
  const [selectedPeer, setSelectedPeer] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      const discover = async () => {
        const peers = await discoverPeers();
        setAvailablePeers(peers);
        if (peers.length > 0) {
          setSelectedPeer(peers[0]);
        }
      };
      discover();
    }
  }, [visible, discoverPeers]);

  useEffect(() => {
    if (visible && fileId && peerId) {
      if (isSender) {
        sendFileP2P(fileId, peerId);
      } else {
        receiveFileP2P(peerId);
      }
    }
  }, [visible, fileId, peerId, isSender, sendFileP2P, receiveFileP2P]);

  const getStatusMessage = () => {
    switch (connectionState) {
      case 'disconnected':
        return 'Disconnected';
      case 'connecting':
        return 'Establishing connection...';
      case 'connected':
        return isSender ? 'Sending file...' : 'Receiving file...';
      case 'completed':
        return 'Transfer complete!';
      case 'failed':
        return 'Transfer failed';
      default:
        return 'Preparing transfer...';
    }
  };

  const getStatusIcon = () => {
    switch (connectionState) {
      case 'disconnected':
        return <Ionicons name="cloud-offline-outline" size={24} color={Colors.warning} />;
      case 'connecting':
        return <ActivityIndicator size="small" color={Colors.primary} />;
      case 'connected':
        return <Ionicons name="cloud-done-outline" size={24} color={Colors.success} />;
      case 'completed':
        return <Ionicons name="checkmark-circle-outline" size={24} color={Colors.success} />;
      case 'failed':
        return <Ionicons name="alert-circle-outline" size={24} color={Colors.error} />;
      default:
        return <Ionicons name="cloud-outline" size={24} color={Colors.primary} />;
    }
  };

  const getProgressBar = () => {
    if (Platform.OS === 'android') {
      return (
        <ProgressBarAndroid
          styleAttr="Horizontal"
          indeterminate={connectionState === 'connecting'}
          progress={progress / 100}
          color={Colors.primary}
          style={{ width: '100%', marginVertical: 20 }}
        />
      );
    } else {
      return (
        <View style={styles.iosProgressContainer}>
          <View style={[styles.iosProgressBar, { width: `${progress}%` }]} />
        </View>
      );
    }
  };

  const handleClose = () => {
    if (isTransferring && connectionState !== 'completed') {
      cancelTransfer();
    }
    onClose();
  };

  const handlePeerSelection = (peerId: string) => {
    setSelectedPeer(peerId);
  };

  const renderPeerSelection = () => {
    if (availablePeers.length === 0) {
      return (
        <View style={styles.peerSelection}>
          <Text style={styles.peerSelectionText}>No peers found on your network</Text>
          <Text style={styles.peerSelectionSubtext}>Make sure both devices are on the same WiFi</Text>
        </View>
      );
    }

    return (
      <View style={styles.peerSelection}>
        <Text style={styles.peerSelectionTitle}>Select a device:</Text>
        {availablePeers.map(peer => (
          <TouchableOpacity
            key={peer}
            style={[
              styles.peerButton,
              selectedPeer === peer && styles.selectedPeerButton
            ]}
            onPress={() => handlePeerSelection(peer)}
          >
            <Text style={[
              styles.peerButtonText,
              selectedPeer === peer && styles.selectedPeerButtonText
            ]}>
              {peer}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {isSender ? 'Send File' : 'Receive File'}
            </Text>
            {getStatusIcon()}
          </View>

          {isSender && renderPeerSelection()}

          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>{progress}%</Text>
            {getProgressBar()}
          </View>

          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>{getStatusMessage()}</Text>
            <Text style={styles.connectionText}>
              Connection: {connectionState}
            </Text>
          </View>

          {connectionState === 'completed' && (
            <Text style={styles.successText}>
              File transferred successfully!
            </Text>
          )}

          {connectionState === 'failed' && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                Transfer failed. Please try again.
              </Text>
              <TouchableOpacity
                style={styles.fallbackButton}
                onPress={() => Alert.alert('Fallback', 'HTTP transfer would be initiated here')}
              >
                <Text style={styles.fallbackButtonText}>Use HTTP Transfer</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.closeButton,
                isTransferring && connectionState !== 'completed' && styles.cancelButton
              ]}
              onPress={handleClose}
            >
              <Text style={styles.closeButtonText}>
                {isTransferring && connectionState !== 'completed' ? 'Cancel' : 'Close'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginRight: 10,
  },
  peerSelection: {
    width: '100%',
    marginBottom: 20,
    padding: 15,
    backgroundColor: Colors.lightBackground,
    borderRadius: 8,
  },
  peerSelectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: Colors.text,
  },
  peerSelectionText: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
  },
  peerSelectionSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 5,
  },
  peerButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.lightBackground,
    marginBottom: 8,
  },
  selectedPeerButton: {
    backgroundColor: Colors.primary,
  },
  peerButtonText: {
    color: Colors.text,
    textAlign: 'center',
  },
  selectedPeerButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 10,
  },
  iosProgressContainer: {
    width: '100%',
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
    marginVertical: 20,
  },
  iosProgressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  statusContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusText: {
    fontSize: 18,
    color: Colors.text,
    marginBottom: 5,
    textAlign: 'center',
    fontWeight: '600',
  },
  connectionText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  successText: {
    fontSize: 16,
    color: Colors.success,
    marginBottom: 20,
    textAlign: 'center',
  },
  errorContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    marginBottom: 15,
    textAlign: 'center',
  },
  fallbackButton: {
    backgroundColor: Colors.warning,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  fallbackButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 10,
  },
  closeButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.error,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
