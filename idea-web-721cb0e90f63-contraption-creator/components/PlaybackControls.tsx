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

  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
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
        }
      );
    }

    return () => {
      if (videoRecorderRef.current?.getRecordingState().isRecording) {
        videoRecorderRef.current?.stopRecording();
      }
    };
  }, [canvasRef, permissionGranted]);

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
      Alert.alert(
        'Permission Required',
        'Please grant camera roll permissions to save videos',
        [
          {
            text: 'OK',
            onPress: async () => {
              const { status } = await MediaLibrary.requestPermissionsAsync();
              setPermissionGranted(status === 'granted');
            },
          },
        ]
      );
      return;
    }

    if (isRecording) {
      const videoUri = await videoRecorderRef.current?.stopRecording();
      if (videoUri) {
        Alert.alert('Success', 'Video saved to camera roll!');
      }
    } else {
      await videoRecorderRef.current?.startRecording();
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
        disabled={!permissionGranted}
      >
        {isRecording ? (
          <Animated.View
            style={[
              styles.recordingIndicator,
              { backgroundColor: recordingIndicatorColor },
            ]}
          />
        ) : (
          <MaterialIcons name="fiber-manual-record" size={24} color={permissionGranted ? 'red' : 'gray'} />
        )}
      </TouchableOpacity>

      {isRecording && (
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{formatTime(recordingTime)}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.saveButton} onPress={onSave}>
        <MaterialIcons name="save" size={24} color="white" />
      </TouchableOpacity>

      {!isPremium && (
        <View style={styles.watermarkNotice}>
          <Text style={styles.watermarkText}>Free users get watermarked videos</Text>
        </View>
      )}
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
    backgroundColor: '#3498db',
    borderRadius: 24,
  },
  recordButton: {
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  recordingIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  timerContainer: {
    position: 'absolute',
    top: -20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  timerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    padding: 12,
    backgroundColor: '#2ecc71',
    borderRadius: 24,
  },
  watermarkNotice: {
    position: 'absolute',
    bottom: -20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  watermarkText: {
    color: '#95a5a6',
    fontSize: 12,
  },
});
