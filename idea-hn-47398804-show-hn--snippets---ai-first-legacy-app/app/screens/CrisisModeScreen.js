import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Clipboard, ActivityIndicator, Share, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { generateCrisisPin, setCrisisPin, verifyCrisisPin, isCrisisModeEnabled, getShareableLink, disableCrisisMode } from '../services/crisisMode';

const CrisisModeScreen = () => {
  const [pin, setPin] = useState('');
  const [generatedPin, setGeneratedPin] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [shareableLink, setShareableLink] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const checkCrisisMode = async () => {
      try {
        const enabled = await isCrisisModeEnabled();
        setIsEnabled(enabled);
        if (enabled) {
          const link = await getShareableLink();
          setShareableLink(link);
          const pinFromLink = link.split('pin=')[1];
          setGeneratedPin(pinFromLink);
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
      const link = await getShareableLink();
      setShareableLink(link);
      setIsEnabled(true);
    } catch (error) {
      console.error('Failed to generate PIN:', error);
      Alert.alert('Error', 'Failed to generate crisis PIN');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVerifyPin = async () => {
    if (!generatedPin) {
      Alert.alert('Error', 'No PIN generated yet');
      return;
    }

    setIsVerifying(true);
    try {
      const isValid = await verifyCrisisPin(generatedPin);
      if (isValid) {
        Alert.alert('Success', 'PIN verified successfully!');
      } else {
        Alert.alert('Error', 'PIN verification failed');
      }
    } catch (error) {
      console.error('PIN verification failed:', error);
      Alert.alert('Error', 'Failed to verify PIN');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopyPin = () => {
    if (!generatedPin) {
      Alert.alert('Error', 'No PIN generated yet');
      return;
    }
    Clipboard.setString(generatedPin);
    Alert.alert('Success', 'PIN copied to clipboard');
  };

  const handleCopyLink = () => {
    if (!shareableLink) {
      Alert.alert('Error', 'No shareable link generated yet');
      return;
    }
    Clipboard.setString(shareableLink);
    Alert.alert('Success', 'Shareable link copied to clipboard');
  };

  const handleShareLink = async () => {
    try {
      if (!shareableLink) {
        Alert.alert('Error', 'No shareable link generated yet');
        return;
      }
      await Share.share({
        message: `Emergency access to my vault: ${shareableLink}`,
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

  const toggleCrisisMode = async () => {
    try {
      if (isEnabled) {
        await disableCrisisMode();
        setIsEnabled(false);
        setGeneratedPin('');
        setShareableLink('');
      } else {
        await handleGeneratePin();
      }
    } catch (error) {
      console.error('Failed to toggle crisis mode:', error);
      Alert.alert('Error', 'Failed to update crisis mode status');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crisis Mode Setup</Text>

      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>Enable Crisis Mode</Text>
        <Switch
          value={isEnabled}
          onValueChange={toggleCrisisMode}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
        />
      </View>

      {isEnabled ? (
        <View style={styles.enabledContainer}>
          <Text style={styles.sectionTitle}>Your Crisis Access</Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Your Crisis PIN:</Text>
            <Text style={styles.infoValue}>{generatedPin || '••••••'}</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Shareable Link:</Text>
            <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="middle">
              {shareableLink || 'Generating link...'}
            </Text>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.copyButton]}
              onPress={handleCopyPin}
              disabled={!generatedPin}
            >
              <Text style={styles.buttonText}>Copy PIN</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.copyButton]}
              onPress={handleCopyLink}
              disabled={!shareableLink}
            >
              <Text style={styles.buttonText}>Copy Link</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.actionButton, styles.shareButton]}
            onPress={handleShareLink}
            disabled={!shareableLink}
          >
            <Text style={styles.buttonText}>Share Link</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.verifyButton]}
            onPress={handleVerifyPin}
            disabled={isVerifying || !generatedPin}
          >
            {isVerifying ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Verify PIN</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.disabledContainer}>
          <Text style={styles.instructionText}>
            Crisis Mode is currently disabled. Enable it to generate a secure PIN and shareable link for family members to access your vault in emergencies.
          </Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Enter Crisis PIN to Access Vault</Text>
        <TextInput
          style={styles.pinInput}
          placeholder="Enter 6-digit PIN"
          keyboardType="numeric"
          maxLength={6}
          secureTextEntry={true}
          value={pin}
          onChangeText={setPin}
        />
        <TouchableOpacity
          style={[styles.actionButton, styles.accessButton]}
          onPress={handlePinSubmit}
          disabled={isLoading || pin.length !== 6}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Access Vault</Text>
          )}
        </TouchableOpacity>
      </View>

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
    color: '#333',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleLabel: {
    fontSize: 16,
    color: '#333',
  },
  enabledContainer: {
    marginBottom: 20,
  },
  disabledContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  infoBox: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  actionButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  copyButton: {
    backgroundColor: '#4CAF50',
  },
  shareButton: {
    backgroundColor: '#2196F3',
    marginBottom: 15,
  },
  verifyButton: {
    backgroundColor: '#FF9800',
  },
  accessButton: {
    backgroundColor: '#9C27B0',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  inputContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  pinInput: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 18,
    backgroundColor: '#f9f9f9',
  },
  instructionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#666',
    fontSize: 16,
  },
});

export default CrisisModeScreen;
