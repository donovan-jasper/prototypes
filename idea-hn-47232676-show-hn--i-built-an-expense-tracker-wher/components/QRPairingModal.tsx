import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Button, StyleSheet, Alert, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import QRCode from 'react-native-qrcode-svg';
import { generateQRCode, handleSignalingData, setEncryptionKey, initializePeerConnection, closeConnection } from '../lib/sync';
import { generateKeyPair } from '../lib/encryption';
import { useStore } from '../lib/store';
import { Ionicons } from '@expo/vector-icons';

export default function QRPairingModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [mode, setMode] = useState<'generate' | 'scan'>('generate');
  const [isProcessing, setIsProcessing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'failed'>('idle');
  const { setPairedDevice, syncStatus } = useStore();

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    if (visible && mode === 'generate') {
      generateCode();
    }
  }, [visible, mode]);

  useEffect(() => {
    if (syncStatus === 'connected') {
      setConnectionStatus('connected');
    } else if (syncStatus === 'offline') {
      setConnectionStatus('failed');
    }
  }, [syncStatus]);

  const generateCode = async () => {
    try {
      setIsProcessing(true);
      setConnectionStatus('connecting');

      // Generate encryption keys
      const keys = generateKeyPair();
      setEncryptionKey(keys.publicKey);

      // Initialize WebRTC connection
      const signalingData = await initializePeerConnection(true);
      const code = await generateQRCode(signalingData);
      setQrCode(code);
    } catch (error) {
      console.error('Error generating QR code:', error);
      Alert.alert('Error', 'Failed to generate QR code');
      setConnectionStatus('failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;

    setScanned(true);
    setIsProcessing(true);
    setConnectionStatus('connecting');

    try {
      // Generate our own keys
      const keys = generateKeyPair();
      setEncryptionKey(keys.publicKey);

      // Process the scanned QR code
      const response = await handleSignalingData(data);

      if (response) {
        // We received an answer, now generate our own QR code to show to the other device
        const code = await generateQRCode(response);
        setQrCode(code);
        setMode('generate');
        Alert.alert(
          'Connection Established',
          'Show this QR code to the other device to complete pairing',
          [{ text: 'OK' }]
        );
      } else {
        // Pairing complete
        Alert.alert('Success', 'Devices paired successfully!');
        setPairedDevice(true);
        setConnectionStatus('connected');
        onClose();
      }
    } catch (error) {
      console.error('Error processing scanned QR code:', error);
      Alert.alert('Error', 'Failed to process QR code. Please try again.');
      setScanned(false);
      setConnectionStatus('failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetConnection = () => {
    closeConnection();
    setConnectionStatus('idle');
    setScanned(false);
    setQrCode('');
    if (mode === 'generate') {
      generateCode();
    }
  };

  const renderConnectionStatus = () => {
    switch (connectionStatus) {
      case 'connecting':
        return (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="small" color="#2e78b7" />
            <Text style={styles.statusText}>Connecting...</Text>
          </View>
        );
      case 'connected':
        return (
          <View style={styles.statusContainer}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={[styles.statusText, { color: '#4CAF50' }]}>Connected</Text>
          </View>
        );
      case 'failed':
        return (
          <View style={styles.statusContainer}>
            <Ionicons name="alert-circle" size={20} color="#F44336" />
            <Text style={[styles.statusText, { color: '#F44336' }]}>Connection failed</Text>
            <TouchableOpacity onPress={resetConnection} style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  if (hasPermission === null) {
    return (
      <Modal visible={visible} onRequestClose={onClose}>
        <View style={styles.container}>
          <Text>Requesting camera permission...</Text>
        </View>
      </Modal>
    );
  }

  if (hasPermission === false) {
    return (
      <Modal visible={visible} onRequestClose={onClose}>
        <View style={styles.container}>
          <Text>No access to camera</Text>
          <Button title="Grant Permission" onPress={() => BarCodeScanner.requestPermissionsAsync().then(({ status }) => setHasPermission(status === 'granted'))} />
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Pair Devices</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {renderConnectionStatus()}

          {mode === 'generate' && (
            <View style={styles.qrContainer}>
              {isProcessing ? (
                <ActivityIndicator size="large" color="#2e78b7" />
              ) : (
                qrCode ? (
                  <QRCode
                    value={qrCode}
                    size={250}
                    color="#2e78b7"
                    backgroundColor="white"
                  />
                ) : (
                  <Text>Generating QR code...</Text>
                )
              )}
              <Text style={styles.instructionText}>
                Scan this QR code on another device to pair
              </Text>
            </View>
          )}

          {mode === 'scan' && (
            <View style={styles.scannerContainer}>
              <BarCodeScanner
                onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.scannerOverlay}>
                <Text style={styles.scannerText}>Scan the QR code from another device</Text>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.modeButton}
            onPress={() => {
              setMode(mode === 'generate' ? 'scan' : 'generate');
              setScanned(false);
            }}
            disabled={isProcessing}
          >
            <Text style={styles.modeButtonText}>
              {mode === 'generate' ? 'Switch to Scanner' : 'Switch to QR Code'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 16,
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  instructionText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  scannerContainer: {
    width: '100%',
    height: 300,
    marginVertical: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  scannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scannerText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  modeButton: {
    backgroundColor: '#2e78b7',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  retryButton: {
    marginLeft: 10,
    padding: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  retryText: {
    color: '#2e78b7',
    fontSize: 14,
  },
});
