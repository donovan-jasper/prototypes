import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Text, View, ActivityIndicator, Linking, Alert, Platform } from 'react-native';
import { checkPermissions, requestPermissions, startRecording, stopRecording, transcribeAudio } from '../lib/voice';

type VoiceButtonProps = {
  onTranscript: (text: string) => void;
  onError?: (error: string) => void;
};

export default function VoiceButton({ onTranscript, onError }: VoiceButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [showRationale, setShowRationale] = useState(false);

  useEffect(() => {
    checkPermissions().then(setPermissionStatus);
  }, []);

  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  const handlePress = async () => {
    if (permissionStatus === 'denied') {
      Alert.alert(
        'Microphone Access Required',
        'VoxCrew needs microphone access to record your voice messages. Please enable this permission in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: openSettings }
        ]
      );
      return;
    }

    if (permissionStatus === 'undetermined') {
      setShowRationale(true);
      const status = await requestPermissions();
      setPermissionStatus(status);
      setShowRationale(false);
      if (status === 'denied') return;
    }

    if (isRecording) {
      try {
        setIsLoading(true);
        const uri = await stopRecording();
        setIsRecording(false);

        if (uri) {
          const { text } = await transcribeAudio(uri);
          onTranscript(text);
        }
      } catch (error) {
        setRecordingError('Failed to process recording. Please try again.');
        onError?.('Recording processing failed');
      } finally {
        setIsLoading(false);
      }
    } else {
      try {
        await startRecording();
        setIsRecording(true);
        setRecordingError(null);
      } catch (error) {
        setRecordingError('Failed to start recording. Please check microphone permissions.');
        onError?.('Recording failed to start');
      }
    }
  };

  if (showRationale) {
    return (
      <View style={styles.container}>
        <View style={styles.rationaleContainer}>
          <Text style={styles.rationaleTitle}>Microphone Access</Text>
          <Text style={styles.rationaleText}>
            VoxCrew needs access to your microphone to record and transcribe your voice messages.
            This helps you communicate hands-free while working in the field.
          </Text>
          <TouchableOpacity style={styles.rationaleButton} onPress={handlePress}>
            <Text style={styles.rationaleButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (permissionStatus === 'denied') {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.settingsButton} onPress={openSettings}>
          <Text style={styles.settingsText}>Enable Microphone in Settings</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Processing your voice message...</Text>
      </View>
    );
  }

  if (recordingError) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{recordingError}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handlePress}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.button, isRecording && styles.recording]}
      onPress={handlePress}
      disabled={permissionStatus === 'denied'}
    >
      <Text style={styles.text}>
        {isRecording ? '🔴 Stop' : '🎤 Talk'}
      </Text>
      {permissionStatus === 'undetermined' && (
        <ActivityIndicator size="small" color="white" style={styles.permissionIndicator} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  rationaleContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  rationaleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  rationaleText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  rationaleButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  rationaleButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 20,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    height: 70,
  },
  recording: {
    backgroundColor: '#FF3B30',
  },
  text: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
  errorText: {
    color: '#FF3B30',
    marginBottom: 8,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 20,
    paddingHorizontal: 20,
  },
  retryText: {
    color: 'white',
    fontWeight: 'bold',
  },
  settingsButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 20,
    paddingHorizontal: 20,
  },
  settingsText: {
    color: 'white',
    fontWeight: 'bold',
  },
  permissionIndicator: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
});
