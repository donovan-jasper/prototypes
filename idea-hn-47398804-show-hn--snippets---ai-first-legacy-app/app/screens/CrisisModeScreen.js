import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Clipboard, ActivityIndicator, Share } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { generateCrisisPin, setCrisisPin, verifyCrisisPin, isCrisisModeEnabled, getShareableLink } from '../services/crisisMode';

const CrisisModeScreen = () => {
  const [pin, setPin] = useState('');
  const [generatedPin, setGeneratedPin] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const checkCrisisMode = async () => {
      try {
        const enabled = await isCrisisModeEnabled();
        setIsEnabled(enabled);
        if (enabled) {
          const pin = await getShareableLink();
          setGeneratedPin(pin.split('=')[1]); // Extract PIN from the URL
        }
      } catch (error) {
        console.error('Failed to check crisis mode status:', error);
      }
    };
    checkCrisisMode();
  }, []);

  const handleGeneratePin = async () => {
    setIsGenerating(true);
    try {
      const newPin = generateCrisisPin();
      setGeneratedPin(newPin);
      await setCrisisPin(newPin);
      setIsEnabled(true);
    } catch (error) {
      console.error('Failed to generate PIN:', error);
      Alert.alert('Error', 'Failed to generate crisis PIN');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyPin = () => {
    Clipboard.setString(generatedPin);
    Alert.alert('Success', 'PIN copied to clipboard');
  };

  const handleShareLink = async () => {
    try {
      const link = await getShareableLink();
      await Share.share({
        message: `Emergency access to my vault: ${link}`,
        title: 'Crisis Access Link'
      });
    } catch (error) {
      console.error('Failed to share link:', error);
      Alert.alert('Error', 'Failed to share crisis link');
    }
  };

  const handlePinSubmit = async () => {
    if (pin.length !== 6) {
      Alert.alert('Error', 'PIN must be 6 digits');
      return;
    }

    setIsLoading(true);
    try {
      const isValid = await verifyCrisisPin(pin);
      if (isValid) {
        navigation.navigate('Vault', { crisisMode: true });
      } else {
        Alert.alert('Error', 'Invalid PIN');
      }
    } catch (error) {
      console.error('PIN verification failed:', error);
      Alert.alert('Error', 'Failed to verify PIN');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crisis Mode Setup</Text>

      {!isEnabled ? (
        <View style={styles.setupContainer}>
          <Text style={styles.instructionText}>
            Generate a 6-digit PIN for family members to access your vault in emergencies.
          </Text>

          <TouchableOpacity
            style={styles.generateButton}
            onPress={handleGeneratePin}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.generateButtonText}>Generate Crisis PIN</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.accessContainer}>
          <Text style={styles.instructionText}>
            Your crisis PIN is: {generatedPin || '••••••'}
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.copyButton, styles.halfButton]}
              onPress={handleCopyPin}
              disabled={!generatedPin}
            >
              <Text style={styles.copyButtonText}>Copy PIN</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.shareButton, styles.halfButton]}
              onPress={handleShareLink}
            >
              <Text style={styles.shareButtonText}>Share Link</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.accessTitle}>Access Vault</Text>
          <Text style={styles.accessSubtitle}>
            Enter the crisis PIN to access the encrypted vault
          </Text>

          <TextInput
            style={styles.pinInput}
            placeholder="Enter 6-digit PIN"
            keyboardType="number-pad"
            maxLength={6}
            secureTextEntry
            value={pin}
            onChangeText={setPin}
          />

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handlePinSubmit}
            disabled={isLoading}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? 'Verifying...' : 'Access Vault'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  setupContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accessContainer: {
    flex: 1,
  },
  instructionText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  generateButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '80%',
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  halfButton: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  copyButton: {
    backgroundColor: '#2196F3',
  },
  shareButton: {
    backgroundColor: '#FF9800',
  },
  copyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  shareButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  accessTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  accessSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  pinInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 18,
    marginBottom: 20,
    backgroundColor: 'white',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 20,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#333',
    fontSize: 16,
  },
});

export default CrisisModeScreen;
