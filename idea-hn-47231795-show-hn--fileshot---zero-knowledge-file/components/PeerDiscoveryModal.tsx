import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useP2PTransfer } from '@/hooks/useP2PTransfer';
import { Colors } from '@/constants/Colors';

interface PeerDiscoveryModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectPeer: (peerId: string) => void;
}

export const PeerDiscoveryModal: React.FC<PeerDiscoveryModalProps> = ({
  visible,
  onClose,
  onSelectPeer
}) => {
  const { discoverPeers, peers } = useP2PTransfer();
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = async () => {
    setIsScanning(true);
    await discoverPeers();
    setIsScanning(false);
  };

  useEffect(() => {
    if (visible) {
      handleScan();
    }
  }, [visible]);

  const renderPeerItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.peerItem}
      onPress={() => onSelectPeer(item)}
    >
      <Text style={styles.peerName}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Select Peer Device</Text>

          {isScanning ? (
            <View style={styles.scanningContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.scanningText}>Scanning for devices...</Text>
            </View>
          ) : (
            <>
              {peers.length > 0 ? (
                <FlatList
                  data={peers}
                  renderItem={renderPeerItem}
                  keyExtractor={(item) => item}
                  style={styles.peerList}
                />
              ) : (
                <Text style={styles.noPeersText}>No devices found on your network</Text>
              )}

              <TouchableOpacity
                style={styles.scanButton}
                onPress={handleScan}
              >
                <Text style={styles.scanButtonText}>Rescan</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Cancel</Text>
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
  scanningContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  scanningText: {
    marginTop: 10,
    color: Colors.textSecondary,
  },
  peerList: {
    width: '100%',
    maxHeight: 200,
    marginBottom: 20,
  },
  peerItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  peerName: {
    fontSize: 16,
    color: Colors.text,
  },
  noPeersText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  scanButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  scanButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: Colors.background,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
});
