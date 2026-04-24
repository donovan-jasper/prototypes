import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Button, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { generateQRCode, handleSignalingData, setEncryptionKey, initializePeerConnection } from '../lib/sync';
import { generateKeyPair } from '../lib/encryption';
import { useStore } from '../lib/store';

export default function QRPairingModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [mode, setMode] = useState<'generate' | 'scan'>('generate');
  const [isProcessing, setIsProcessing] = useState(false);
  const { setPairedDevice } = useStore();

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

  const generateCode = async () => {
    try {
      setIsProcessing(true);
      const keys = generateKeyPair();
      setEncryptionKey(keys.publicKey);

      const signalingData = await initializePeerConnection(true);
      const code = await generateQRCode(signalingData);
      setQrCode(code);
    } catch (error) {
      console.error('Error generating QR code:', error);
      Alert.alert('Error', 'Failed to generate QR code');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    setIsProcessing(true);

    try {
      const keys = generateKeyPair();
      setEncryptionKey(keys.publicKey);

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
        onClose();
      }
    } catch (error) {
      console.error('Error processing scanned QR code:', error);
      Alert.alert('Error', 'Failed to process QR code. Please try again.');
      setScanned(false);
    } finally {
      setIsProcessing(false);
    }
  };

  if (hasPermission === null) {
    return (
      <Modal visible={visible} onRequestClose={onClose}>
        <View style={styles.container}>
          <ActivityIndicator size="large" />
          <Text>Requesting camera permission...</Text>
        </View>
      </Modal>
    );
  }

  if (hasPermission === false) {
    return (
      <Modal visible={visible} onRequestClose={onClose}>
        <View style={styles.container}>
          <Text style={styles.errorText}>No access to camera</Text>
          <Button title="Close" onPress={onClose} />
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} onRequestClose={onClose} animationType="slide">
      <View style={styles.container}>
        <Text style={styles.title}>Pair New Device</Text>

        <View style={styles.modeSelector}>
          <Button
            title="Show QR Code"
            onPress={() => {
              setMode('generate');
              setScanned(false);
            }}
            color={mode === 'generate' ? '#2e78b7' : '#999'}
          />
          <View style={styles.buttonSpacer} />
          <Button
            title="Scan QR Code"
            onPress={() => {
              setMode('scan');
              setScanned(false);
            }}
            color={mode === 'scan' ? '#2e78b7' : '#999'}
          />
        </View>

        {mode === 'generate' ? (
          <View style={styles.qrContainer}>
            <Text style={styles.instructionText}>
              Scan this QR code on the other device:
            </Text>
            {isProcessing ? (
              <View style={styles.processingContainer}>
                <ActivityIndicator size="large" color="#2e78b7" />
                <Text>Generating connection...</Text>
              </View>
            ) : (
              <ScrollView style={styles.qrCodeScroll}>
                <Text style={styles.qrCodeText} selectable>
                  {qrCode}
                </Text>
              </ScrollView>
            )}
            <Text style={styles.noteText}>
              Note: This contains WebRTC connection data
            </Text>
          </View>
        ) : (
          <View style={styles.scannerContainer}>
            <Text style={styles.instructionText}>
              Point camera at the QR code on the other device
            </Text>
            <BarCodeScanner
              onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
              style={styles.scanner}
            />
            {scanned && !isProcessing && (
              <Button
                title="Tap to Scan Again"
                onPress={() => setScanned(false)}
              />
            )}
            {isProcessing && (
              <View style={styles.processingContainer}>
                <ActivityIndicator size="large" color="#2e78b7" />
                <Text>Processing connection...</Text>
              </View>
            )}
          </View>
        )}

        <Button title="Cancel" onPress={onClose} color="#999" />
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  buttonSpacer: {
    width: 20,
  },
  qrContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  qrCodeScroll: {
    maxHeight: 200,
    marginBottom: 20,
  },
  qrCodeText: {
    fontSize: 16,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  noteText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  scanner: {
    width: '100%',
    height: 300,
    marginBottom: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
  processingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
});
