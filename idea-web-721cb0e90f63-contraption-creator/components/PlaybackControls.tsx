import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { VideoRecorder } from '../lib/video';
import { useStore } from '../lib/store';
import * as MediaLibrary from 'expo-media-library';

interface PlaybackControlsProps {
  canvasRef: React.RefObject<any>;
  onSave: () => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({ canvasRef, onSave }) => {
  const { isPlaying, togglePlay, resetSimulation, isPremium } = useStore();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingState, setRecordingState] = useState({
    isRecording: false,
    duration: 0,
  });
  const videoRecorderRef = useRef<VideoRecorder | null>(null);
  const recordingIndicatorAnim = useRef(new Animated.Value(0)).current;
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<MediaLibrary.PermissionResponse | null>(null);

  useEffect(() => {
    (async () => {
      const { status, canAskAgain } = await MediaLibrary.getPermissionsAsync();
      setPermissionStatus({ status, canAskAgain });
      setPermissionGranted(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    if (canvasRef.current && permissionGranted) {
      videoRecorderRef.current = new VideoRecorder(
        canvasRef,
        (state) => {
          setRecordingState(state);
          setIsRecording(state.isRecording);
          setRecordingTime(state.duration);
        },
        isPremium
      );
    }

    return () => {
      if (videoRecorderRef.current?.getRecordingState().isRecording) {
        videoRecorderRef.current?.stopRecording();
      }
    };
  }, [canvasRef, permissionGranted, isPremium]);

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(recordingIndicatorAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(recordingIndicatorAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      recordingIndicatorAnim.stopAnimation();
      recordingIndicatorAnim.setValue(0);
    }
  }, [isRecording]);

  const handleRecord = async () => {
    if (!permissionGranted) {
      if (permissionStatus?.canAskAgain) {
        Alert.alert(
          'Permission Required',
          'Please grant camera roll permissions to save videos',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'OK',
              onPress: async () => {
                const { status, canAskAgain } = await MediaLibrary.requestPermissionsAsync();
                setPermissionStatus({ status, canAskAgain });
                setPermissionGranted(status === 'granted');
              },
            },
          ]
        );
      } else {
        Alert.alert(
          'Permission Required',
          'Please enable camera roll permissions in your device settings',
          [
            {
              text: 'OK',
            },
          ]
        );
      }
      return;
    }

    if (isRecording) {
      try {
        const videoUri = await videoRecorderRef.current?.stopRecording();
        if (videoUri) {
          Alert.alert('Success', 'Video saved to camera roll!');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to save video. Please try again.');
        console.error('Recording error:', error);
      }
    } else {
      try {
        await videoRecorderRef.current?.startRecording();
      } catch (error) {
        Alert.alert('Error', 'Failed to start recording. Please try again.');
        console.error('Recording error:', error);
      }
    }
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const recordingIndicatorColor = recordingIndicatorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#FF0000', '#FF6666'],
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={togglePlay}>
        <MaterialIcons
          name={isPlaying ? 'pause' : 'play-arrow'}
          size={24}
          color="white"
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={resetSimulation}>
        <MaterialIcons name="replay" size={24} color="white" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.recordButton, !permissionGranted && styles.disabledButton]}
        onPress={handleRecord}
      >
        {isRecording ? (
          <View style={styles.recordingIndicatorContainer}>
            <Animated.View
              style={[
                styles.recordingIndicator,
                { backgroundColor: recordingIndicatorColor },
              ]}
            />
            <Text style={styles.recordingTime}>{formatTime(recordingTime)}</Text>
          </View>
        ) : (
          <MaterialIcons name="fiber-manual-record" size={24} color="white" />
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={onSave}>
        <MaterialIcons name="save" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#2c3e50',
    borderTopWidth: 1,
    borderTopColor: '#34495e',
  },
  button: {
    padding: 12,
    borderRadius: 24,
    backgroundColor: '#3498db',
  },
  recordButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  recordingIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  recordingTime: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
