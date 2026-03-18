import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { generateQRCode, handleSignalingData, setEncryptionKey } from '../lib/sync';
import { generateKeyPair } from '../lib/encryption';

export default function QRPairingModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [mode, setMode] = useState<'generate' | 'scan'>('generate');
  const [isProcessing, setIsProcessing] = useState(false);

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
      
      const code = await generateQRCode();
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
        Alert.alert(
          'Connection Established',
          'Show this QR code to the other device to complete pairing',
          [
            {
              text: 'OK',
              onPress: () => {
                setQrCode(response);
                setMode('generate');
              },
            },
          ]
        );
      } else {
        Alert.alert('Success', 'Devices paired successfully!');
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
              <Text>Generating...</Text>
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
            {isProcessing && <Text style={styles.processingText}>Processing...</Text>}
          </View>
        )}

        <View style={styles.buttonContainer}>
          <Button title="Close" onPress={onClose} color="#666" />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  buttonSpacer: {
    width: 16,
  },
  qrContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  qrCodeScroll: {
    maxHeight: 300,
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  qrCodeText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#333',
  },
  noteText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  scannerContainer: {
    flex: 1,
    alignItems: 'center',
  },
  scanner: {
    width: 300,
    height: 300,
    marginVertical: 16,
  },
  processingText: {
    fontSize: 16,
    color: '#2e78b7',
    marginTop: 16,
  },
  buttonContainer: {
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 16,
  },
});
