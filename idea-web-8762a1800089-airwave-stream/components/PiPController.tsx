import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, AppState, TouchableOpacity, Text } from 'react-native';
import { Video, AVPlaybackStatus } from 'expo-av';
import { useRouter } from 'expo-router';
import { useStreamUrl } from '../hooks/useStreamUrl';

interface PiPControllerProps {
  channelNumber: string;
  isLocal: boolean;
}

export default function PiPController({ channelNumber, isLocal }: PiPControllerProps) {
  const router = useRouter();
  const { streamUrl } = useStreamUrl(channelNumber);
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus>({} as AVPlaybackStatus);
  const [isPiPActive, setIsPiPActive] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background' && !isPiPActive) {
        enterPiPMode();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isPiPActive]);

  const enterPiPMode = async () => {
    if (!videoRef.current) return;

    try {
      if (Platform.OS === 'android') {
        await videoRef.current.presentFullscreenPlayer();
      } else if (Platform.OS === 'ios') {
        await videoRef.current.presentPictureInPictureAsync();
      }
      setIsPiPActive(true);
    } catch (error) {
      console.error('Failed to enter PiP mode:', error);
    }
  };

  const exitPiPMode = async () => {
    if (!videoRef.current) return;

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
  };

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    setStatus(status);
    setIsBuffering(status.isBuffering || !status.isLoaded);

    if (status.error) {
      console.error('Playback error:', status.error);
    }
  };

  if (!streamUrl) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Loading stream...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        style={styles.video}
        source={{ uri: streamUrl }}
        useNativeControls={!isPiPActive}
        resizeMode="contain"
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        shouldPlay
        isMuted={isPiPActive}
      />

      {isBuffering && !isPiPActive && (
        <View style={styles.bufferingIndicator}>
          <Text style={styles.bufferingText}>Buffering...</Text>
        </View>
      )}

      {!isPiPActive && (
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.pipButton}
            onPress={enterPiPMode}
          >
            <Text style={styles.pipButtonText}>Enter PiP</Text>
          </TouchableOpacity>
        </View>
      )}

      {isPiPActive && (
        <View style={styles.pipControls}>
          <TouchableOpacity
            style={styles.exitButton}
            onPress={exitPiPMode}
          >
            <Text style={styles.exitButtonText}>Exit PiP</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  video: {
    flex: 1,
  },
  bufferingIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  bufferingText: {
    color: '#fff',
    fontSize: 16,
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  pipButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    padding: 10,
    borderRadius: 5,
  },
  pipButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  pipControls: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  exitButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    padding: 8,
    borderRadius: 5,
  },
  exitButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});
