import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import { Camera } from 'expo-camera';
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
      <Camera
        style={styles.camera}
        type={cameraType}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={styles.cornerTopLeft} />
            <View style={styles.cornerTopRight} />
            <View style={styles.cornerBottomLeft} />
            <View style={styles.cornerBottomRight} />
          </View>
          <Text style={styles.scanText}>Scan a barcode to add media</Text>
        </View>
      </Camera>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={toggleCameraType}
        >
          <MaterialIcons name="flip-camera-android" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setShowManualEntry(true)}
        >
          <MaterialIcons name="keyboard" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="close" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {isScanning && (
        <View style={styles.scanningOverlay}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.scanningText}>Looking up barcode...</Text>
        </View>
      )}
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
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: 'white',
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: 'white',
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: 'white',
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: 'white',
  },
  scanText: {
    color: 'white',
    marginTop: 20,
    fontSize: 16,
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
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    color: 'white',
    fontSize: 18,
    marginTop: 20,
    textAlign: 'center',
  },
  instructions: {
    color: 'white',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  upgradeButton: {
    backgroundColor: '#6200EE',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  manualEntryTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  manualEntryInput: {
    backgroundColor: 'white',
    width: '80%',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 20,
  },
  manualEntryButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
  },
  manualEntryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
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
  scanningOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanningText: {
    color: 'white',
    fontSize: 16,
    marginTop: 20,
  },
});

export default BarcodeScanner;
