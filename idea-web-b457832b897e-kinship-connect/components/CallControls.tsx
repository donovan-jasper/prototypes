import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

interface CallControlsProps {
  isMuted: boolean;
  isCameraOn: boolean;
  onMuteToggle: () => void;
  onCameraToggle: () => void;
  onSwitchCamera: () => void;
  onEndCall: () => void;
}

const CallControls: React.FC<CallControlsProps> = ({
  isMuted,
  isCameraOn,
  onMuteToggle,
  onCameraToggle,
  onSwitchCamera,
  onEndCall,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingRef = React.useRef<Audio.Recording | null>(null);
  const recordingTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleRecordToggle = async () => {
    if (isRecording) {
      // Stop recording
      if (recordingRef.current) {
        try {
          await recordingRef.current.stopAndUnloadAsync();
          const uri = recordingRef.current.getURI();
          console.log('Recording saved at:', uri);

          // Show alert with recording duration
          const minutes = Math.floor(recordingDuration / 60);
          const seconds = recordingDuration % 60;
          Alert.alert(
            'Recording Saved',
            `Call recording saved (${minutes}:${seconds.toString().padStart(2, '0')})`,
            [{ text: 'OK' }]
          );
        } catch (error) {
          console.error('Failed to stop recording', error);
        }
      }

      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }

      setIsRecording(false);
      setRecordingDuration(0);
    } else {
      // Start recording with consent
      Alert.alert(
        'Recording Consent',
        'This call will be recorded. Do you consent to recording?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Consent',
            onPress: async () => {
              try {
                await Audio.requestPermissionsAsync();
                await Audio.setAudioModeAsync({
                  allowsRecordingIOS: true,
                  playsInSilentModeIOS: true,
                });

                const { recording } = await Audio.Recording.createAsync(
                  Audio.RecordingOptionsPresets.HIGH_QUALITY
                );
                recordingRef.current = recording;

                // Start recording timer
                recordingTimerRef.current = setInterval(() => {
                  setRecordingDuration(prev => prev + 1);
                }, 1000);

                setIsRecording(true);
              } catch (error) {
                console.error('Failed to start recording', error);
                Alert.alert('Error', 'Failed to start recording');
              }
            },
          },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.controlButton} onPress={onMuteToggle}>
        <Ionicons
          name={isMuted ? 'mic-off' : 'mic'}
          size={24}
          color={isMuted ? '#ff3b30' : '#fff'}
        />
        <Text style={[styles.buttonText, isMuted && styles.mutedText]}>
          {isMuted ? 'Unmute' : 'Mute'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.controlButton} onPress={onCameraToggle}>
        <Ionicons
          name={isCameraOn ? 'videocam' : 'videocam-off'}
          size={24}
          color={isCameraOn ? '#fff' : '#ff3b30'}
        />
        <Text style={[styles.buttonText, !isCameraOn && styles.mutedText]}>
          {isCameraOn ? 'Camera On' : 'Camera Off'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.controlButton} onPress={onSwitchCamera}>
        <Ionicons name="camera-reverse" size={24} color="#fff" />
        <Text style={styles.buttonText}>Flip</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.controlButton, isRecording && styles.recordingButton]}
        onPress={handleRecordToggle}
      >
        <Ionicons
          name={isRecording ? 'stop-circle' : 'radio'}
          size={24}
          color={isRecording ? '#ff3b30' : '#fff'}
        />
        <Text style={[styles.buttonText, isRecording && styles.recordingText]}>
          {isRecording ? 'Stop' : 'Record'}
        </Text>
        {isRecording && (
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingDuration}>
              {Math.floor(recordingDuration / 60)}:{recordingDuration % 60 < 10 ? '0' : ''}{recordingDuration % 60}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={[styles.controlButton, styles.endCallButton]} onPress={onEndCall}>
        <Ionicons name="call" size={24} color="#fff" />
        <Text style={styles.buttonText}>End</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  controlButton: {
    alignItems: 'center',
    padding: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  mutedText: {
    color: '#ff3b30',
  },
  recordingText: {
    color: '#ff3b30',
  },
  recordingButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    borderRadius: 30,
    padding: 10,
  },
  endCallButton: {
    backgroundColor: '#ff3b30',
    borderRadius: 30,
    padding: 10,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff3b30',
    marginRight: 4,
  },
  recordingDuration: {
    color: '#ff3b30',
    fontSize: 12,
  },
});

export default CallControls;
