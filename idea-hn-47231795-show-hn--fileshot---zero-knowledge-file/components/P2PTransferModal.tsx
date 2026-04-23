import React, { useEffect } from 'react';
import { View, Text, Modal, StyleSheet, ActivityIndicator, TouchableOpacity, ProgressBarAndroid, Platform } from 'react-native';
import { useP2PTransfer } from '@/hooks/useP2PTransfer';
import { Colors } from '@/constants/Colors';

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
    receiveFileP2P
  } = useP2PTransfer();

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
            {getProgressBar()}
          </View>

          <Text style={styles.statusText}>{getStatusMessage()}</Text>

          <Text style={styles.connectionText}>
            Connection: {connectionState}
          </Text>

          {connectionState === 'completed' && (
            <Text style={styles.successText}>
              File transferred successfully!
            </Text>
          )}

          {connectionState === 'failed' && (
            <Text style={styles.errorText}>
              Transfer failed. Please try again.
            </Text>
          )}

          <TouchableOpacity
            style={[
              styles.closeButton,
              (isTransferring && connectionState !== 'completed') && styles.disabledButton
            ]}
            onPress={onClose}
            disabled={isTransferring && connectionState !== 'completed'}
          >
            <Text style={styles.closeButtonText}>
              {isTransferring && connectionState !== 'completed' ? 'Please wait...' : 'Close'}
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
  successText: {
    fontSize: 16,
    color: Colors.success,
    marginBottom: 20,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    marginBottom: 20,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: Colors.disabled,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
