import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Clipboard, ActivityIndicator, Share, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { generateCrisisPin, setCrisisPin, verifyCrisisPin, isCrisisModeEnabled, getShareableLink, disableCrisisMode } from '../services/crisisMode';
import { addNote } from '../services/database';
import { transcribeAudio } from '../services/whisper';

const CrisisModeScreen = () => {
  const [pin, setPin] = useState('');
  const [generatedPin, setGeneratedPin] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [shareableLink, setShareableLink] = useState('');
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState('');
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

  const startRecording = async () => {
    try {
      setIsRecording(true);
      setRecordingStatus('Recording...');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording');
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      setRecordingStatus('Processing...');
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      // Transcribe the audio
      const transcription = await transcribeAudio(uri);
      if (transcription) {
        // Save to database
        await addNote('Crisis Recording', transcription, uri);
        Alert.alert('Success', 'Recording saved successfully');
      } else {
        Alert.alert('Error', 'Failed to transcribe audio');
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording');
    } finally {
      setIsRecording(false);
      setRecordingStatus('');
    }
  };

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

      <View style={styles.recordingContainer}>
        <Text style={styles.sectionTitle}>Emergency Recording</Text>
        {!isRecording ? (
          <TouchableOpacity
            style={styles.recordButton}
            onPress={startRecording}
          >
            <Text style={styles.recordButtonText}>Start Recording</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.recordButton, styles.stopButton]}
            onPress={stopRecording}
          >
            <Text style={styles.recordButtonText}>Stop Recording</Text>
          </TouchableOpacity>
        )}
        {recordingStatus ? (
          <Text style={styles.recordingStatus}>{recordingStatus}</Text>
        ) : null}
      </View>

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
        <View style={styles.pinContainer}>
          <Text style={styles.pinLabel}>Your Crisis PIN:</Text>
          <Text style={styles.pinText}>{generatedPin || 'Generating...'}</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleCopyPin}
            >
              <Text style={styles.actionButtonText}>Copy PIN</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleVerifyPin}
              disabled={isVerifying}
            >
              {isVerifying ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.actionButtonText}>Verify PIN</Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.linkLabel}>Shareable Link:</Text>
          <Text style={styles.linkText} numberOfLines={1}>
            {shareableLink || 'Generating...'}
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleCopyLink}
            >
              <Text style={styles.actionButtonText}>Copy Link</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleShareLink}
            >
              <Text style={styles.actionButtonText}>Share Link</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.pinInput}
            placeholder="Enter PIN to access vault"
            keyboardType="numeric"
            maxLength={6}
            value={pin}
            onChangeText={setPin}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handlePinSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Access Vault</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
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
    marginBottom: 20,
    color: '#666',
  },
  recordingContainer: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  recordButton: {
    backgroundColor: '#ff4757',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  stopButton: {
    backgroundColor: '#2ed573',
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recordingStatus: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
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
  pinContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pinLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  pinText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2ed573',
    textAlign: 'center',
  },
  linkLabel: {
    fontSize: 16,
    marginTop: 15,
    marginBottom: 5,
    color: '#333',
  },
  linkText: {
    fontSize: 14,
    marginBottom: 15,
    color: '#666',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  actionButton: {
    backgroundColor: '#1e90ff',
    padding: 10,
    borderRadius: 5,
    flex: 0.48,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  pinInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#2ed573',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CrisisModeScreen;
