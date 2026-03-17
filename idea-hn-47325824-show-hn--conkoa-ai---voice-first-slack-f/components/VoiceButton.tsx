import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Text, View, ActivityIndicator, Linking, Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Linking from 'expo-linking';

type VoiceButtonProps = {
  onTranscript: (text: string) => void;
  onError?: (error: string) => void;
};

export default function VoiceButton({ onTranscript, onError }: VoiceButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [recordingError, setRecordingError] = useState<string | null>(null);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const { status } = await Audio.getPermissionsAsync();
    setPermissionStatus(status);
  };

  const requestPermissions = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    setPermissionStatus(status);
    return status;
  };

  const openSettings = () => {
    Linking.openSettings();
  };

  const handlePress = async () => {
    if (permissionStatus === 'denied') {
      Alert.alert(
        'Microphone Access Required',
        'Please enable microphone access in settings to use voice features',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: openSettings }
        ]
      );
      return;
    }

    if (permissionStatus === 'undetermined') {
      const status = await requestPermissions();
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

  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      return recording;
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  };

  const stopRecording = async () => {
    if (!recording) return null;

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    return uri;
  };

  const transcribeAudio = async (audioUri: string): Promise<{ text: string }> => {
    try {
      // Read audio file as base64
      const base64 = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Call OpenAI Whisper API
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: base64,
          model: 'whisper-1',
        }),
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const data = await response.json();
      return { text: data.text };
    } catch (error) {
      console.error('Transcription error:', error);
      throw error;
    }
  };

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
