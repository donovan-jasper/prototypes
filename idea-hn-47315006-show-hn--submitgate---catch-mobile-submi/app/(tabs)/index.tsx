import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { scanBuild } from '../../lib/scanner';
import { useStore } from '../../store/useStore';
import { saveScan } from '../../lib/database';

export default function ScannerScreen() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);
  const { scanCount, isPremium, incrementScanCount, setCurrentScan, addScan } = useStore();

  const maxFreeScans = 3;
  const scansRemaining = maxFreeScans - scanCount;

  useEffect(() => {
    // Initialize database when component mounts
    const initDB = async () => {
      try {
        await initDatabase();
        // Load initial data if needed
      } catch (error) {
        console.error('Database initialization failed:', error);
      }
    };

    initDB();
  }, []);

  const handleSelectFile = async () => {
    if (!isPremium && scanCount >= maxFreeScans) {
      Alert.alert(
        'Scan Limit Reached',
        'You\'ve used all 3 free scans. Upgrade to Premium for unlimited scans.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/settings') },
        ]
      );
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/octet-stream', '*/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      const fileName = file.name.toLowerCase();

      if (!fileName.endsWith('.ipa') && !fileName.endsWith('.apk')) {
        Alert.alert(
          'Invalid File',
          'Please select an IPA (iOS) or APK (Android) file.',
          [{ text: 'OK' }]
        );
        return;
      }

      setIsScanning(true);

      // Determine platform
      const platform = fileName.endsWith('.ipa') ? 'ios' : 'android';

      // Scan the file
      const scanResult = await scanBuild(file.uri, platform);

      // Save to database
      await saveScan(scanResult);

      // Update store
      setCurrentScan(scanResult);
      addScan(scanResult);
      incrementScanCount();

      setIsScanning(false);

      // Navigate to results
      router.push('/scan-results');

    } catch (error) {
      setIsScanning(false);
      Alert.alert(
        'Scan Failed',
        error instanceof Error ? error.message : 'An unknown error occurred',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>SubmitGuard</Text>
        <Text style={styles.subtitle}>Catch rejections before they happen</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="shield-checkmark" size={80} color="#007AFF" />
        </View>

        <Text style={styles.instruction}>
          Select an IPA or APK file to scan for compliance issues
        </Text>

        <TouchableOpacity
          style={[styles.scanButton, isScanning && styles.scanButtonDisabled]}
          onPress={handleSelectFile}
          disabled={isScanning}
        >
          {isScanning ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="document" size={24} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.scanButtonText}>Select Build File</Text>
            </>
          )}
        </TouchableOpacity>

        {!isPremium && (
          <View style={styles.limitContainer}>
            <Text style={styles.limitText}>
              {scansRemaining > 0
                ? `${scansRemaining} of ${maxFreeScans} free scans remaining`
                : 'No free scans remaining'}
            </Text>
            <TouchableOpacity onPress={() => router.push('/settings')}>
              <Text style={styles.upgradeLink}>Upgrade to Premium</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={20} color="#34C759" />
            <Text style={styles.featureText}>Privacy manifest validation</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={20} color="#34C759" />
            <Text style={styles.featureText}>Icon & asset verification</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={20} color="#34C759" />
            <Text style={styles.featureText}>Instant actionable fixes</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#F8F8F8',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 20,
  },
  instruction: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  scanButtonDisabled: {
    opacity: 0.7,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  limitContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  limitText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  upgradeLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  featuresContainer: {
    width: '100%',
    marginTop: 20,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#333333',
    marginLeft: 8,
  },
});
