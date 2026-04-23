import React from 'react';
import { View, Text, Modal, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useP2PTransfer } from '@/hooks/useP2PTransfer';
import { Colors } from '@/constants/Colors';

export const P2PTransferModal = ({ visible, onClose, fileId, peerId, isSender }) => {
  const {
    isTransferring,
    progress,
    connectionState,
    sendFileP2P,
    receiveFileP2P
  } = useP2PTransfer();

  React.useEffect(() => {
    if (visible && fileId && peerId) {
      if (isSender) {
        sendFileP2P(fileId, peerId);
      } else {
        receiveFileP2P(peerId);
      }
    }
  }, [visible, fileId, peerId, isSender]);

  const getStatusMessage = () => {
    switch (connectionState) {
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

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>
            {isSender ? 'Sending File' : 'Receiving File'}
          </Text>

          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>{progress}%</Text>
            <ActivityIndicator
              size="large"
              color={Colors.primary}
              style={styles.activityIndicator}
            />
          </View>

          <Text style={styles.statusText}>{getStatusMessage()}</Text>

          <Text style={styles.connectionText}>
            Connection: {connectionState}
          </Text>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            disabled={isTransferring}
          >
            <Text style={styles.closeButtonText}>
              {isTransferring ? 'Please wait...' : 'Close'}
            </Text>
          </TouchableOpacity>
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
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors.text,
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
  activityIndicator: {
    marginBottom: 10,
  },
  statusText: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  connectionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
