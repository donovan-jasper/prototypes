import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { lookupBarcode } from '../lib/api';
import { useMediaStore } from '../store/mediaStore';
import { usePremiumStore } from '../store/premiumStore';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const BarcodeScanner = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraType, setCameraType] = useState(Camera.Type.back);
  const [manualEntry, setManualEntry] = useState('');
  const [showManualEntry, setShowManualEntry] = useState(false);

  const { addMedia } = useMediaStore();
  const { isPremium } = usePremiumStore();
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned || !isPremium) return;

    setScanned(true);
    setIsScanning(true);

    try {
      const media = await lookupBarcode(data);
      if (media) {
        await addMedia(media);
        Alert.alert('Success', 'Media added successfully!');
        navigation.goBack();
      } else {
        Alert.alert('Not Found', 'No media found for this barcode. Please try another.');
        setScanned(false);
      }
    } catch (error) {
      console.error('Barcode lookup error:', error);
      Alert.alert('Error', 'Failed to lookup barcode. Please try again.');
      setScanned(false);
    } finally {
      setIsScanning(false);
    }
  };

  const handleManualEntry = async () => {
    if (!manualEntry.trim()) {
      Alert.alert('Error', 'Please enter a barcode number');
      return;
    }

    setIsScanning(true);
    try {
      const media = await lookupBarcode(manualEntry);
      if (media) {
        await addMedia(media);
        Alert.alert('Success', 'Media added successfully!');
        navigation.goBack();
      } else {
        Alert.alert('Not Found', 'No media found for this barcode. Please try another.');
      }
    } catch (error) {
      console.error('Barcode lookup error:', error);
      Alert.alert('Error', 'Failed to lookup barcode. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const toggleCameraType = () => {
    setCameraType(
      cameraType === Camera.Type.back ? Camera.Type.front : Camera.Type.back
    );
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6200EE" />
        <Text style={styles.message}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <MaterialIcons name="camera-alt" size={60} color="#ccc" />
        <Text style={styles.message}>No access to camera</Text>
        <Text style={styles.instructions}>
          Please enable camera permissions in your device settings to use barcode scanning.
        </Text>
      </View>
    );
  }

  if (!isPremium) {
    return (
      <View style={styles.container}>
        <MaterialIcons name="lock" size={60} color="#6200EE" />
        <Text style={styles.message}>Premium Feature</Text>
        <Text style={styles.instructions}>
          Barcode scanning is available to premium users only. Upgrade to unlock this feature.
        </Text>
        <TouchableOpacity
          style={styles.upgradeButton}
          onPress={() => navigation.navigate('Premium')}
        >
          <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (showManualEntry) {
    return (
      <View style={styles.container}>
        <Text style={styles.manualEntryTitle}>Enter Barcode Manually</Text>
        <TextInput
          style={styles.manualEntryInput}
          placeholder="Enter barcode number"
          value={manualEntry}
          onChangeText={setManualEntry}
          keyboardType="numeric"
          autoFocus
        />
        <View style={styles.manualEntryButtons}>
          <TouchableOpacity
            style={[styles.manualEntryButton, styles.cancelButton]}
            onPress={() => setShowManualEntry(false)}
          >
            <Text style={styles.manualEntryButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.manualEntryButton, styles.submitButton]}
            onPress={handleManualEntry}
            disabled={isScanning}
          >
            {isScanning ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.manualEntryButtonText}>Submit</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        type={cameraType}
        barcodeScannerSettings={{
          barcodeTypes: [BarCodeScanner.Constants.BarCodeType.ean13],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={styles.cornerTopLeft} />
            <View style={styles.cornerTopRight} />
            <View style={styles.cornerBottomLeft} />
            <View style={styles.cornerBottomRight} />
          </View>
          <Text style={styles.scanText}>Scan a barcode</Text>
        </View>
      </CameraView>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={toggleCameraType}
          disabled={isScanning}
        >
          <MaterialIcons name="flip-camera-android" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.scanButton]}
          onPress={() => setScanned(false)}
          disabled={!scanned || isScanning}
        >
          <MaterialIcons name="refresh" size={24} color="white" />
          <Text style={styles.scanButtonText}>Scan Again</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.manualButton]}
          onPress={() => setShowManualEntry(true)}
          disabled={isScanning}
        >
          <MaterialIcons name="keyboard" size={24} color="white" />
          <Text style={styles.scanButtonText}>Manual Entry</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 50,
    height: 50,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: 'white',
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 50,
    height: 50,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: 'white',
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 50,
    height: 50,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: 'white',
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 50,
    height: 50,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: 'white',
  },
  scanText: {
    color: 'white',
    fontSize: 18,
    marginTop: 20,
    textAlign: 'center',
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  controlButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 12,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  manualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  scanButtonText: {
    color: 'white',
    marginLeft: 8,
  },
  message: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    fontWeight: 'bold',
  },
  instructions: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    margin: 20,
    paddingHorizontal: 20,
  },
  upgradeButton: {
    backgroundColor: '#6200EE',
    padding: 15,
    borderRadius: 8,
    margin: 20,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  manualEntryTitle: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  manualEntryInput: {
    backgroundColor: 'white',
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 8,
    fontSize: 18,
    marginBottom: 20,
  },
  manualEntryButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  manualEntryButton: {
    padding: 15,
    borderRadius: 8,
    width: '40%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  submitButton: {
    backgroundColor: '#6200EE',
  },
  manualEntryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BarcodeScanner;
