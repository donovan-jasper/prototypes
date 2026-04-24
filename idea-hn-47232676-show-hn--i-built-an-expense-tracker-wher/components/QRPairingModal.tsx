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
          <Button title="Grant Permission" onPress={() => BarCodeScanner.requestPermissionsAsync()} />
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Pair Devices</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {renderConnectionStatus()}

        <View style={styles.modeSelector}>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'generate' && styles.activeMode]}
            onPress={() => setMode('generate')}
          >
            <Text style={styles.modeText}>Show QR Code</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'scan' && styles.activeMode]}
            onPress={() => setMode('scan')}
          >
            <Text style={styles.modeText}>Scan QR Code</Text>
          </TouchableOpacity>
        </View>

        {mode === 'generate' ? (
          <View style={styles.qrContainer}>
            {isProcessing ? (
              <ActivityIndicator size="large" color="#2e78b7" />
            ) : (
              qrCode ? (
                <QRCode
                  value={qrCode}
                  size={250}
                  color="#000"
                  backgroundColor="#fff"
                />
              ) : (
                <Text>Generating QR code...</Text>
              )
            )}
            <Text style={styles.instructionText}>
              Scan this QR code with another device to pair
            </Text>
          </View>
        ) : (
          <View style={styles.scannerContainer}>
            <BarCodeScanner
              onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
              style={StyleSheet.absoluteFillObject}
            />
            {scanned && (
              <Button
                title={'Tap to Scan Again'}
                onPress={() => setScanned(false)}
              />
            )}
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Pairing establishes a secure connection between devices
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 16,
  },
  retryButton: {
    marginLeft: 10,
    padding: 5,
    backgroundColor: '#2e78b7',
    borderRadius: 5,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
  },
  modeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  modeButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  activeMode: {
    backgroundColor: '#2e78b7',
    borderColor: '#2e78b7',
  },
  modeText: {
    color: '#000',
    fontWeight: 'bold',
  },
  qrContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  instructionText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  scannerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    padding: 10,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
