import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, AppState } from 'react-native';
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
    if (Platform.OS === 'android' && videoRef.current) {
      try {
        await videoRef.current.presentFullscreenPlayer();
        setIsPiPActive(true);
      } catch (error) {
        console.error('Failed to enter PiP mode:', error);
      }
    } else if (Platform.OS === 'ios' && videoRef.current) {
      try {
        await videoRef.current.presentPictureInPictureAsync();
        setIsPiPActive(true);
      } catch (error) {
        console.error('Failed to enter PiP mode:', error);
      }
    }
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

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    setStatus(status);
    if (status.isLoaded && status.isPlaying && isPiPActive) {
      // Keep PiP active while playing
    }
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        style={styles.video}
        source={{ uri: streamUrl }}
        useNativeControls
        resizeMode="contain"
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        shouldPlay
      />
      {isPiPActive && (
        <View style={styles.pipControls}>
          {/* Add PiP controls here (exit button, etc.) */}
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
  pipControls: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 5,
  },
});
