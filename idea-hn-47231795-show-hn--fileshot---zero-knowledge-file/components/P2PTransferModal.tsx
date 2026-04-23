import React, { useEffect, useState } from 'react';
import { View, Text, Modal, StyleSheet, ActivityIndicator, TouchableOpacity, ProgressBarAndroid, Platform, Alert, FlatList } from 'react-native';
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
    peers,
    discoverPeers,
    sendFileP2P,
    receiveFileP2P,
    cancelTransfer
  } = useP2PTransfer();
  const [selectedPeer, setSelectedPeer] = useState<string | null>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);

  useEffect(() => {
    if (visible && isSender) {
      discoverPeers();
    }
  }, [visible, isSender, discoverPeers]);

  useEffect(() => {
    if (visible && fileId && peerId) {
      if (isSender) {
        sendFileP2P(fileId, peerId);
      } else {
        receiveFileP2P(peerId);
      }
    }
  }, [visible, fileId, peerId, isSender, sendFileP2P, receiveFileP2P]);

  const handleDiscoverPeers = async () => {
    setIsDiscovering(true);
    await discoverPeers();
    setIsDiscovering(false);
  };

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

  const renderPeerItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.peerItem,
        selectedPeer === item && styles.selectedPeerItem
      ]}
      onPress={() => handlePeerSelection(item)}
    >
      <Ionicons
        name="phone-portrait-outline"
        size={20}
        color={selectedPeer === item ? Colors.white : Colors.primary}
      />
      <Text style={[
        styles.peerItemText,
        selectedPeer === item && styles.selectedPeerItemText
      ]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderPeerSelection = () => {
    if (peers.length === 0) {
      return (
        <View style={styles.emptyPeersContainer}>
          <Ionicons name="search-outline" size={48} color={Colors.gray} />
          <Text style={styles.emptyPeersText}>No devices found</Text>
          <Text style={styles.emptyPeersSubtext}>
            Make sure both devices are on the same WiFi network
          </Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleDiscoverPeers}
            disabled={isDiscovering}
          >
            {isDiscovering ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <>
                <Ionicons name="refresh" size={16} color={Colors.white} />
                <Text style={styles.refreshButtonText}>Refresh</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.peerListContainer}>
        <Text style={styles.peerListTitle}>Available Devices:</Text>
        <FlatList
          data={peers}
          renderItem={renderPeerItem}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.peerList}
        />
      </View>
    );
  };

  const renderTransferControls = () => {
    if (connectionState === 'completed') {
      return (
        <TouchableOpacity
          style={[styles.controlButton, styles.completeButton]}
          onPress={handleClose}
        >
          <Text style={styles.controlButtonText}>Done</Text>
        </TouchableOpacity>
      );
    }

    if (connectionState === 'failed') {
      return (
        <TouchableOpacity
          style={[styles.controlButton, styles.retryButton]}
          onPress={() => {
            if (isSender && selectedPeer) {
              sendFileP2P(fileId!, selectedPeer);
            } else if (!isSender && peerId) {
              receiveFileP2P(peerId);
            }
          }}
        >
          <Text style={styles.controlButtonText}>Retry</Text>
        </TouchableOpacity>
      );
    }

    if (isTransferring) {
      return (
        <TouchableOpacity
          style={[styles.controlButton, styles.cancelButton]}
          onPress={cancelTransfer}
        >
          <Text style={styles.controlButtonText}>Cancel</Text>
        </TouchableOpacity>
      );
    }

    if (isSender && selectedPeer) {
      return (
        <TouchableOpacity
          style={[styles.controlButton, styles.sendButton]}
          onPress={() => sendFileP2P(fileId!, selectedPeer!)}
        >
          <Text style={styles.controlButtonText}>Send File</Text>
        </TouchableOpacity>
      );
    }

    return null;
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
              {isSender ? 'Send File via P2P' : 'Receive File via P2P'}
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color={Colors.gray} />
            </TouchableOpacity>
          </View>

          <View style={styles.statusContainer}>
            {getStatusIcon()}
            <Text style={styles.statusText}>{getStatusMessage()}</Text>
          </View>

          {getProgressBar()}

          {isSender && renderPeerSelection()}

          {renderTransferControls()}
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
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusText: {
    marginLeft: 10,
    fontSize: 16,
    color: Colors.text,
  },
  iosProgressContainer: {
    height: 5,
    width: '100%',
    backgroundColor: Colors.lightGray,
    borderRadius: 5,
    overflow: 'hidden',
    marginVertical: 20,
  },
  iosProgressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 5,
  },
  peerListContainer: {
    marginVertical: 20,
  },
  peerListTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: Colors.text,
  },
  peerList: {
    paddingVertical: 10,
  },
  peerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: Colors.lightGray,
  },
  selectedPeerItem: {
    backgroundColor: Colors.primary,
  },
  peerItemText: {
    marginLeft: 10,
    fontSize: 16,
    color: Colors.text,
  },
  selectedPeerItemText: {
    color: Colors.white,
  },
  emptyPeersContainer: {
    alignItems: 'center',
    padding: 20,
    marginVertical: 20,
  },
  emptyPeersText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    color: Colors.text,
  },
  emptyPeersSubtext: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
    marginTop: 5,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 15,
  },
  refreshButtonText: {
    color: Colors.white,
    marginLeft: 5,
    fontSize: 14,
  },
  controlButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  sendButton: {
    backgroundColor: Colors.primary,
  },
  cancelButton: {
    backgroundColor: Colors.warning,
  },
  retryButton: {
    backgroundColor: Colors.error,
  },
  completeButton: {
    backgroundColor: Colors.success,
  },
  controlButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
