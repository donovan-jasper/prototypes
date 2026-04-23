import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Platform } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { useStreamUrl } from '../hooks/useStreamUrl';

interface Props {
  channelNumber: string;
}

export default function PiPController({ channelNumber }: Props) {
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [isPiPActive, setIsPiPActive] = useState(true);
  const { streamUrl } = useStreamUrl(channelNumber);
  const videoRef = useRef<Video>(null);

  useEffect(() => {
    const setupPiP = async () => {
      if (videoRef.current && Platform.OS === 'ios') {
        try {
          await videoRef.current.presentPictureInPictureAsync();
          setIsPiPActive(true);
        } catch (error) {
          console.error('Failed to enter PiP mode:', error);
        }
      }
    };

    setupPiP();

    return () => {
      if (videoRef.current && Platform.OS === 'ios') {
        videoRef.current.stopPictureInPictureAsync();
      }
    };
  }, []);

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    setStatus(status);
  };

  const exitPiPMode = async () => {
    if (videoRef.current) {
      try {
        if (Platform.OS === 'android') {
          await videoRef.current.dismissFullscreenPlayer();
        } else if (Platform.OS === 'ios') {
          await videoRef.current.stopPictureInPictureAsync();
        }
        setIsPiPActive(false);
      } catch (error) {
        console.error('Failed to exit PiP mode:', error);
      }
    }
  };

  if (!isPiPActive) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        style={styles.video}
        source={{ uri: streamUrl }}
        useNativeControls={false}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
        isLooping={false}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
      />

      <TouchableOpacity
        style={styles.exitButton}
        onPress={exitPiPMode}
      >
        <Text style={styles.exitButtonText}>Exit PiP</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 150,
    height: 84,
    backgroundColor: 'black',
    borderRadius: 5,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  exitButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 5,
    borderRadius: 3,
  },
  exitButtonText: {
    color: 'white',
    fontSize: 12,
  },
});
