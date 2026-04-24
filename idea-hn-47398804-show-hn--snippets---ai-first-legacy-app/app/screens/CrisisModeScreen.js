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
      Alert.alert('Success', 'Crisis mode enabled successfully!');
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
        Alert.alert('Success', 'Crisis mode disabled');
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
      <Text style={styles.description}>
        Generate a 6-digit PIN for family members to access your vault in emergencies.
      </Text>

      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>Enable Crisis Mode</Text>
        <Switch
          value={isEnabled}
          onValueChange={toggleCrisisMode}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
        />
      </View>

      {isEnabled && (
        <View style={styles.enabledContainer}>
          <Text style={styles.sectionTitle}>Your Crisis Access</Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Your Crisis PIN:</Text>
            <View style={styles.pinContainer}>
              <Text style={styles.pinText}>{generatedPin || 'Generating...'}</Text>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={handleCopyPin}
                disabled={!generatedPin}
              >
                <Text style={styles.copyButtonText}>Copy</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Shareable Link:</Text>
            <View style={styles.linkContainer}>
              <Text style={styles.linkText} numberOfLines={1}>
                {shareableLink || 'Generating...'}
              </Text>
              <View style={styles.linkButtons}>
                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={handleCopyLink}
                  disabled={!shareableLink}
                >
                  <Text style={styles.linkButtonText}>Copy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.linkButton, styles.shareButton]}
                  onPress={handleShareLink}
                  disabled={!shareableLink}
                >
                  <Text style={styles.linkButtonText}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.verifyButton}
            onPress={handleVerifyPin}
            disabled={isVerifying || !generatedPin}
          >
            {isVerifying ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.verifyButtonText}>Verify PIN</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <TextInput
        style={styles.input}
        placeholder="Enter 6-digit PIN"
        keyboardType="numeric"
        maxLength={6}
        value={pin}
        onChangeText={setPin}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handlePinSubmit}
        disabled={isLoading || pin.length !== 6}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Access Vault</Text>
        )}
      </TouchableOpacity>

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
    marginBottom: 10,
    color: '#333',
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
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
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  pinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pinText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  copyButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  copyButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  linkContainer: {
    marginTop: 5,
  },
  linkText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  linkButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  linkButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  shareButton: {
    marginLeft: 5,
    marginRight: 0,
  },
  linkButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  verifyButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  backButtonText: {
    color: '#333',
    fontSize: 16,
  },
});

export default CrisisModeScreen;
