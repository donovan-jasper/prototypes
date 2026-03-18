import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { scanIPA } from '../../lib/scanner/iosScanner';
import { useStore } from '../../store/useStore';

export default function ScannerScreen() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);
  const { scanCount, isPremium, incrementScanCount, setCurrentScan } = useStore();
  
  const maxFreeScans = 3;
  const scansRemaining = maxFreeScans - scanCount;

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
      let issues;
      if (platform === 'ios') {
        issues = await scanIPA(file.uri);
      } else {
        // Android scanner not implemented yet
        Alert.alert('Coming Soon', 'Android scanning will be available in the next update.');
        setIsScanning(false);
        return;
      }

      // Create scan result
      const scanResult = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        platform,
        fileName: file.name,
        issues,
        passed: issues.filter(i => i.severity === 'critical').length === 0,
      };

      // Save to store
      setCurrentScan(scanResult);
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
    backgroundColor: '#F2F2F7',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  instruction: {
    fontSize: 16,
    color: '#3C3C43',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  scanButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scanButtonDisabled: {
    opacity: 0.6,
  },
  buttonIcon: {
    marginRight: 8,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  limitContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  limitText: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  upgradeLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  featuresContainer: {
    marginTop: 48,
    width: '100%',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 15,
    color: '#3C3C43',
    marginLeft: 12,
  },
});
